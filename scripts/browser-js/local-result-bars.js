var colour = require('../colours.json');

module.exports = function(){

    var width = 400;
    var height = 400;
    var barHeight = 60;
    var barGap = 50;
    var margin = {
        top: 30, left: 0, bottom: 20, right:0,
    };

    var data = [];
    var barValueScale = d3.scale.linear()
        .range([0, width - (margin.left + margin.right)])
        .domain([0, 100]);

    function chart(parent){
        //if parent has no child then add the basics
        parent
            .selectAll('svg').data([1]).enter()
            .append('svg')
                .attr({
                    'class': 'local-result-chart',
                    'width': width,
                    'height': height,
                    'viewBox': '0 0 ' + width + ' ' + height,
                    'style': 'width: 100%; height: 100%;',
                })
            .append('g')
                .attr('transform','translate('+margin.left+','+margin.top+')');
        
        var localframe = d3.select('svg.local-result-chart');

        localframe.selectAll('g.context-bar')
            .data(data)
                .enter()
            .append('g')
                .attr('class','context-bar')
                .attr('transform',function(d,i){ return 'translate(0,' +(i*(barHeight+barGap))+ ')'; })
            .call(function(parent){
                parent.append('rect')
                    .attr('class','bar-background')
                    .attr('x', 0)
                    .attr('y', 5)
                    .attr('width', barValueScale(100))
                    .attr('height', barHeight/2);

                parent.append('text').attr('class', 'bar-title');
                parent.append('text')
                    .attr('class', 'bar-remain-value')
                    .attr('y',barHeight)
                    .attr('dy',2);

                parent.append('text')
                    .attr('class', 'bar-leave-value')
                    .attr('y',barHeight)
                    .attr('x',barValueScale(100))
                    .attr('dy',2)
                    .attr('text-anchor', 'end');

                parent.append('rect').attr('class', 'bar-leave');
                parent.append('rect').attr('class', 'bar-remain');
                parent.append('line')
                    .attr('x1', barValueScale(50))
                    .attr('y1', 0)
                    .attr('x2', barValueScale(50))
                    .attr('y2', barHeight)
                    .attr('class', 'local-bar-axis');
            });
        
        localframe.selectAll('g.context-bar')
            .call(function(parent){
                parent.select('text.bar-title')
                    .text(function(d){ return d.title; });
                
                parent.transition()
                    .select('rect.bar-remain')
                    .attr({
                        x:0,
                        y:5,
                        width: function(d){ return barValueScale( d.data.remain_percentage_share ); },
                        height: barHeight/2,
                        fill: colour.remainColour,
                    });

                parent.transition()
                    .select('rect.bar-leave')
                    .attr({
                        x:function(d){ return barValueScale( d.data.remain_percentage_share ); },
                        y:5,
                        width: function(d){ return barValueScale( d.data.leave_percentage_share ); },
                        height: barHeight/2,
                        fill: colour.leaveColour,
                    });

                parent.select('text.bar-leave-value')
                    .html(function(d){
                        return '<tspan class="leave-highlight">'+d3.round(d.data.leave_percentage_share, 1) + '%</tspan> LEAVE ';
                    })

                parent.select('text.bar-remain-value')
                    .html(function(d){
                        return 'REMAIN <tspan class="remain-highlight">' + d3.round(d.data.remain_percentage_share, 1) + '%</tspan>';
                    });
            });
    }

    chart.data = function(x){
        data = x;
        console.log(data);
        return chart;
    };

    return chart;
};