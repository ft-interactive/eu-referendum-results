var REGION_NAMES;

d3.csv('../data/ons/regions.csv', function (csv) {
	REGION_NAMES = csv;

	d3.json('dummyresult/regional.json', drawRegionalResultTable);
})

function drawRegionalResultTable(results) {
	var table = d3.select('.regional-result').append('table');
	makeHeaders(table);

	table
		.selectAll('table>tr')
		.data(results.sort(function (first, second) {
			return (second.remain_abs - second.leave_abs) - (first.remain_abs - first.leave_abs)
		}))
		.call(function(join) {
			var rows = join.enter().append('tr');

			// Region name
			rows.append('td')
				.attr('width', '30%')
				.attr('class', 'region')
				.text(function (d) {
					var region = REGION_NAMES.find(function (region) {
						return region.id === d.region_id;
					});
					return region.name;
				});

			// Margin % column
			rows.append('td')
				.attr('width', '10%')
				.attr('class', 'result')
				.text(function (d) {
					return Math.round(Math.abs(d.remain_pct - d.leave_pct)) + '%';
				});

			// Result column
			var difference = rows.append('td')
				.attr('width', '60%')
				.append('ul')
				.attr('class', 'container');

			// Margin Absolute number
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

			// Bar
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

					var color = d3.scale.threshold()
					    .domain([0])
					    .range([LEAVE_COLOR,STAY_COLOR]);

					return color(d.remain_abs - d.leave_abs);
				})
				.style('width', function (d) {

					// maxAbsolute is the largest bar we have in either direction
					var maxAbsolute = d3.max(results, function (d) {
						return Math.abs(d.remain_abs - d.leave_abs);
					});

					return Math.abs((d.remain_abs - d.leave_abs)/maxAbsolute) * 100 + '%'
				});
			
			// Margin % column
			rows.append('td')
				.attr('width', '10%')
				.attr('class', 'result')
				.text(function (d) {
					return Math.round(d.turnout_pct) + '%';
				});
			}
		);
}

function makeHeaders (table) {
	var row = table
		.append('thead')
		.append('tr');

	row
		.append('th')
		.text('Region name')
	row
		.append('th')
		.text('Margin')
	row
		.append('th')
		.text('Difference')
	row
		.append('th')
		.text('Turnout')
}
