
// What % of the td do we want the bars to take up
var BAR_WIDTH = 100;
var REGIONS;

d3.csv('../data/ons/regions.csv', function (csv) {

	REGIONS = csv;

	d3.json('dummyresult/regional.json', drawRegionalResultTable);
})



function drawRegionalResultTable(results) {

	// maxAbsolute is the largest bar we have in either direction
	var maxAbsolute = d3.max(results, function (d) {
		return Math.abs(d.remain_abs - d.leave_abs);
	});

	var max = d3.max(results, function (d) {
		return d.remain_abs - d.leave_abs;
	});

	var min = d3.min(results, function (d) {
		return d.remain_abs - d.leave_abs;
	});

	var color = d3.scale.linear()
	    .domain([min, min/NARROW_PCT, max/NARROW_PCT, max])
	    .range([LEAVE_COLOR, LEAVE_NARROW_COLOR, STAY_NARROW_COLOR, STAY_COLOR]);

	var table = d3.select('.regional-result').append('table');

	table
		.selectAll('tr')
		.data(results.sort(function (first, second) {
			return (second.remain_abs - second.leave_abs) - (first.remain_abs - first.leave_abs)
		}))
		.call(function(join) {
			var rows = join.enter().append('tr');

			rows.append('td')
				.attr('width', '30%')
				.attr('class', 'region')
				.text(function (d) {
					var region = REGIONS.find(function (region) {
						return region.id === d.region_id;
					});
					return region.name;
				});

			rows.append('td')
				.attr('width', '10%')
				.attr('class', 'result')
				.style('background', function (d) {
					return color(d.remain_abs - d.leave_abs);
				})
				.text(function (d) {
					return d.remain_abs > d.leave_abs ? STAY_LABEL : LEAVE_LABEL;
				});

			var difference = rows.append('td')
				.attr('width', '60%')
				.append('ul')
				.attr('class', 'container');

			difference
				.append('li')
				.attr('class', 'buffer');

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
					return Math.abs(d.remain_abs - d.leave_abs).toLocaleString();
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
					return Math.abs((d.remain_abs - d.leave_abs)/maxAbsolute)*BAR_WIDTH + '%'
				});
			}
		);
}