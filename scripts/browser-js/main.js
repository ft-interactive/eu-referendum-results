var d3 = require('d3');
var topojson = require('topojson');
var map = require('./map.js')();
var colour = require('../colours.json');
var topology = JSON.parse( d3.select('#topo-data').text() );
var localResults = JSON.parse( d3.select('#local-result-data').text() );
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
        return d.local_id;
    })
    .fillScale(function(d){
        if(d.leave_pct <= 50) return colour.remainColour;
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

//draw the areas for which we have results
map.features( uk.features );
mapframe.selectAll('.area').data(localResults)
    .call(map)
    .on('click', function(d,i){ 
        console.log(d); 
    });