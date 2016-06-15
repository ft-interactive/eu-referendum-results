//var d3 = require('d3');
//var topojson = require('topojson');
var map = require('./map.js')();
var colour = require('../colours.json');
var find = require('lodash/find');
var topology = JSON.parse( d3.select('#topo-data').text() );

var localResults = JSON.parse( d3.select('#local-result-data').text() );

var regionalResults = JSON.parse( d3.select('#regional-result-data').text() );

var nationalResults = JSON.parse( d3.select('#national-result-data').text() );

var mapWidth=400, mapHeight = 600;

var selectionDispatcher = d3.dispatch('select');

// sort out the data
var uk = topojson.feature( topology, topology.objects.gb );
var ukLand = topojson.merge( topology, topology.objects.gb.geometries.concat(topology.objects.ni.geometries).filter(function(d){
    return d.id != 'S12000027';
}) );

var londonLand = topojson.merge( topology, topology.objects.gb.geometries.filter(function(d){
    return d.properties.region == 'E12000007'; 
}) );

var shetlandLand = topojson.merge( topology, topology.objects.gb.geometries.filter(function(d){
    return d.id == 'S12000027'; 
}) );

uk.features = uk.features.concat( topojson.feature(topology, topology.objects.ni).features );

//set up map basics
map.id(function(d){
        return d.ons_id;
    })
    .fillScale(function(d){
        if(d.leave_percentage_share <= 50) return colour.remainColour;
        return colour.leaveColour;
    });

var mapframe = d3.select('#local-map')
    .append('svg')
        .attr({
            'width': mapWidth,
            'height': mapHeight,
            'viewBox': '0 0 ' + mapWidth + ' ' + mapHeight,
            'style':'width:100%; height:100%;',
        });

//add map furniture
mapframe.append('rect')
    .attr({
        x: 260,
        y: 25,
        width: 135,
        height: 110,
        'class':'map-frame',
    });

mapframe.append('text')
    .text('London')
    .attr('class','map-label')
    .attr('transform','translate(260,155)');

mapframe.append('rect')
    .attr({
        x: 20,
        y: 25,
        width: 45,
        height: 80,
        'class':'map-frame',
    });

mapframe.append('text')
    .text('Shetland')
    .attr('class','map-label')
    .attr('transform','translate(20,125)');

// do the land drawing
mapframe.append('path')
    .attr('class','land')
    .attr('d', map.land(ukLand) )

mapframe.append('path')
    .attr('class','land')
    .attr('d', map.land(londonLand, 'london') )
    
mapframe.append('path')
    .attr('class','land')
    .attr('d', map.land(shetlandLand, 'shetland') )

//add the areas for which we have results
map.features( uk.features );
mapframe.selectAll('.area').data(localResults.filter(function(d){
        return d.state > 2;
    }))
    .call(map)
    .on('click', function(d,i){ 
        selectionDispatcher.select(d);
    });

//add the svg for the local area chart
var localChartWidth = 400;
var localChartHeight = 400;
var localBarHeight = 30;
var localBarGap = 20;
var localChartMargin = {
    top: 20, left: 20, bottom: 20, right:20,
};

var localframe = d3.select('.location-data')
    .append('svg')
        .attr({
            'class': 'local-result-chart',
            'width': localChartWidth,
            'height': localChartHeight,
            'viewBox': '0 0 ' + localChartWidth + ' ' + localChartHeight,
            'style': 'width: 100%; height: 100%;',
        })
    .append('g')
        .attr('transform','translate('+localChartMargin.left+','+localChartMargin.top+')');

//create the scales for the local area chart
var barValueScale = d3.scale.linear()
    .range([0, localChartWidth-(localChartMargin.left+localChartMargin.right)])
    .domain([0, 100]);

selectionDispatcher.on('select.local-context', function(localResult){
    console.log(localResult)
    var regionResult = find(regionalResults, function(e){
        return e.id === localResult.region_id ;
    });
    var contextResults = [
        {
            title:localResult.name,
            data:localResult,
        },
        {
            title:regionResult.short_name,
            data:regionResult,
        },
        {
            title:'National',
            data:nationalResults,
        },
    ];

    localframe.append('line')
        .attr('x1', barValueScale(50))
        .attr('y1', 0)
        .attr('x2', barValueScale(50))
        .attr('y2', (localBarHeight+localBarGap) * contextResults.length - localBarGap)
        .attr('class', 'local-bar-axis');

    localframe.selectAll('g.context-bar')
        .data(contextResults)
            .enter()
        .append('g')
            .attr('class','context-bar')
            .attr('transform',function(d,i){ return 'translate(0,' +(i*(localBarHeight+localBarGap))+ ')'; })
        .call(function(parent){

            parent.append('text')
                .attr('class', 'bar-title');

            parent.append('text')
                .attr('class','bar-value-label');

            parent.append('rect');
        });
    
    localframe.selectAll('g.context-bar')
        .call(function(parent){
            parent.select('text.bar-title')
                .text(function(d){ return d.title + ' ' +d3.round(d.data.leave_percentage_share,1)+'%'; });
            
            parent.transition()
                .select('rect')
                    .attr('x', function(d){
                        if(d.data.leave_percentage_share < 50){ 
                            return barValueScale( d.data.leave_percentage_share ); 
                        }
                        return barValueScale( 50 );
                    })
                    .attr('y',0)
                    .attr('width',function(d){
                        if(d.data.leave_percentage_share < 50){ 
                            return Math.abs( barValueScale( d.data.leave_percentage_share - 50 )); 
                        }
                        return Math.abs( barValueScale( 50 - d.data.leave_percentage_share ));
                    })
                    .attr('height', localBarHeight)
                    .attr('fill', function(d){
                        if(d.data.leave_percentage_share > 50){
                            return colour.leaveColour;
                        }
                        return colour.remainColour;
                    });
        });
});

selectionDispatcher.on('select.map', function(d){
    var bounds = d3.select('#area-' + d.ons_id).node().getBBox();
    var highlightData = [{
            cx:bounds.x + bounds.width/2,
            cy:bounds.y + bounds.height/2,
            r:Math.max(10, Math.max(bounds.height/2, bounds.width/2)),
        }];
    
    var join = mapframe.selectAll('g.highlight-area')
        .data(highlightData);
    
    join.enter()
        .append('g').attr('class', 'highlight-area')
        .call(function(parent){
            parent.append('circle').attr('class','highlight-background');
            parent.append('circle').attr('class','highlight-foreground');
        });
    
    join.transition().select('circle.highlight-background')
        .attr('r', function(d){ return d.r; })
        .attr('cx', function(d){ return d.cx; })
        .attr('cy', function(d){ return d.cy; });
    
    join.transition().select('circle.highlight-foreground')
        .attr('r', function(d){ return d.r; })
        .attr('cx', function(d){ return d.cx; })
        .attr('cy', function(d){ return d.cy; });
});