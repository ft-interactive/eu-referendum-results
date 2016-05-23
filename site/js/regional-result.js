console.log('regional results');

d3.json('dummyresult/regional.json', drawRegionalResultTable);

function drawRegionalResultTable(results){
    var dataJoin = 

    d3.select('.regional-result')
        .append('table')
        .selectAll('tr')
        .data(results.sort(function (first, second) {
        	return (second.leave_pct - second.remain_pct) - (first.leave_pct - first.remain_pct)
  		}))
        .call(function(join){
        	console.log('join', join.enter())

            var rows = join.enter()
            .append('tr')
            .append('div')
            .style('width', function (d) {
            	return Math.abs(d.leave_pct - d.remain_pct) + '%'
            })
            .attr('class', function (d) {
            	return d.leave_pct - d.remain_pct > 0 ? 'right_bar' : 'left_bar'
            })
            .text(function (d) {
            	return d.leave_pct - d.remain_pct
            })
        });
        
}