const d3 = require('d3');

module.exports = function(data){
    const width = 300;
    const height = 20;
    const margin = {top:0,left:40,bottom:0,right:40,};

    let scale = d3.scale.linear()
        .domain([0,100])
        .range([0, width-(margin.left + margin.right) ]);
    
    let commas = d3.format("0,000");



    let layedOut = data.map(function(d){
        console.log(d.name)
        return {
            name:d.name,
            state: d.state,
            leave_percentage_share: d.leave_percentage_share,
            remain_percentage_share: d.remain_percentage_share,
            leave_votes: commas(d.leave_votes),
            remain_votes: commas(d.remain_votes),
            ons_id: d.ons_id,
            region_id: d.region_id,
            barStartX: margin.left,
            barStartY: margin.top,
            barTotalWidth:scale(100),
            barHeight:height-(margin.top+margin.bottom),
            leaveBarWidth:scale(d.leave_percentage_share),
            remainBarWidth:scale(d.remain_percentage_share),
        };
    }).sort(function(a,b){
        return b.leave_percentage_share - a.leave_percentage_share;
    });

    return {
        axisX:scale(50)+margin.left,
        data:layedOut,
        svgWidth:width,
        svgHeight:height,
    }
}