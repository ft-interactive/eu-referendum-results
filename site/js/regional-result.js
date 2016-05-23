console.log('regional results');

d3.json('dummyresult/regional.json', drawRegionalResultTable);

function drawRegionalResultTable(results){
	var dataJoin = 

	d3.select('.regional-result')
		.append('table')
		.selectAll('tr')
		.data(results.sort(function (first, second) {
			return (second.remain_pct - second.leave_pct) - (first.remain_pct - first.leave_pct)
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
					return d.remain_pct - d.leave_pct > 0 ? 'push-right' : 'push-left';
				})
				.text(function (d) {
					return Math.abs(d.remain_abs - d.leave_abs);
				});

			difference
				.append('li')
				.attr('class', function (d) {
					return d.remain_pct - d.leave_pct > 0 ? 'right-item item' : 'left-item item' ;
				})
				.append('div')
				.attr('class', function (d) {
					return d.remain_pct - d.leave_pct > 0 ? 'result-bar push-left' : 'result-bar push-right';
				})
				.style('width', function (d) {
					return Math.abs(d.remain_pct - d.leave_pct) + '%'
				});

			// differenceCell
			// 	.append('div')
			// 	.attr('class', function (d) {
			// 		return d.remain_pct - d.leave_pct > 0 ? 'right_bar' : 'left_bar'
			// 	})
			// 	.style('width', function (d) {
			// 		return Math.abs(d.remain_pct - d.leave_pct) + '%'
			// 	});
		});
		
}