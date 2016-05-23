console.log('regional results');

d3.json('dummyresult/regional.json', drawRegionalResultTable);

function drawRegionalResultTable(results) {

	var max = d3.max(results, function (d) {
		return Math.abs(d.remain_abs - d.leave_abs);
	})

	var color = d3.scale.linear()
	    .domain([-max, 0, max])
	    .range(["blue", "cyan", "green"]);

	d3.select('.regional-result')
		.append('table')
		.selectAll('tr')
		.data(results.sort(function (first, second) {
			return (second.remain_abs - second.leave_abs) - (first.remain_abs - first.leave_abs)
		}))
		.call(function(join){
			console.log('join', join.enter())

			var rows = join.enter().append('tr');

			rows.append('td')
				.attr('width', '30%')
				.attr('class', 'region')
				.text(function (d) {
					return d.region_id;
				});

			rows.append('td')
				.attr('width', '10%')
				.attr('class', 'result')
				.text(function (d) {
					return d.remain_abs > d.leave_abs ? 'STAY' : 'LEAVE';
				});

			var difference = rows.append('td')
				.attr('width', '60%')
				.append('ul')
				.attr('class', 'container');

			difference
				.append('li')
				.attr('class', function (d) {
					return d.remain_pct - d.leave_pct > 0 ? 'left-item item' : 'right-item item' ;
				})
				.append('div')
				.attr('class', function (d) {
					return d.remain_pct - d.leave_pct > 0 ? 'result-text push-right' : 'result-text push-left';
				})
				.text(function (d) {
					return 'remain: ' +  d.remain_abs.toLocaleString()
						 + ' leave:' + d.leave_abs.toLocaleString()
						 + ' diff:' + Math.abs(d.remain_abs - d.leave_abs).toLocaleString()
						 + ' remain_pct:' + d.remain_pct.toLocaleString()
						 + ' leave_pct:' + d.leave_pct.toLocaleString()
						 + ' diff_pct:' + Math.abs(d.remain_pct - d.leave_pct).toLocaleString();
				});

			difference
				.append('li')
				.attr('class', function (d) {
					return d.remain_abs - d.leave_abs > 0 ? 'right-item item' : 'left-item item' ;
				})
				.append('div')
				.attr('class', function (d) {
					return d.remain_abs - d.leave_abs > 0 ? 'result-bar push-left' : 'result-bar push-right';
				})
				.style('background', function (d) {
					return color(d.remain_abs - d.leave_abs);
				})
				.style('width', function (d) {
					return Math.abs((d.remain_abs - d.leave_abs)/max)*100 + '%'
				});
		});
		
}