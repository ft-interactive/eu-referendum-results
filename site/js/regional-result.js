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
			return getAbs(second) - getAbs(first)
		}))
		.call(function(join) {
			var rows = join.enter().append('tr');

			// Region name
			rows.append('td')
				.attr('class', 'region')
				.text(function (d) {
					var region = REGION_NAMES.find(function (region) {
						return region.id === d.region_id;
					});
					return region.name;
				});

			// Margin % column
			rows.append('td')
				.attr('class', 'margin')
				.text(function (d) {
					return Math.round(Math.abs(getPct(d))) + '%';
				});

			// Result column
			var difference = rows.append('td')
				.attr('class', 'result')
				.append('ul')
				.attr('class', 'container');

			// Margin Absolute number
			difference
				.append('li')
				.attr('class', function (d) {
					return getPct(d) > 0 ? 'left-item item' : 'right-item item' ;
				})
				.append('div')
				.attr('class', function (d) {
					return getPct(d) > 0 ? 'result-text push-right' : 'result-text push-left';
				})
				.text(function (d) {
					return Math.abs(getAbs(d)).toLocaleString();
				});

			// Bar
			difference
				.append('li')
				.attr('class', function (d) {
					return getAbs(d) > 0 ? 'right-item item' : 'left-item item' ;
				})
				.append('div')
				.attr('class', function (d) {
					return getAbs(d) > 0 ? 'result-bar push-left' : 'result-bar push-right';
				})
				.style('background', function (d) {

					var color = d3.scale.threshold()
					    .domain([0])
					    .range([LOSE_BLUE,WIN_BLUE]);

					return color(getAbs(d));
				})
				.style('width', function (d) {

					// maxAbsolute is the largest bar we have in either direction
					var maxAbsolute = d3.max(results, function (d) {
						return Math.abs(getAbs(d));
					});

					return Math.abs((getAbs(d))/maxAbsolute) * 100 + '%'
				});
			
			// Turnout % column
			rows.append('td')
				.attr('class', 'turnout')
				.text(function (d) {
					return Math.round(d.turnout_pct) + '%';
				});
			}
		);
}

function getPct (d) {
	var winner_pct = WINNER === 'remain' ? d.remain_pct : d.leave_pct;
	var loser_pct = WINNER === 'remain' ? d.leave_pct : d.remain_pct;
	return winner_pct - loser_pct;
}

function getAbs (d) {
	var winner_abs = WINNER === 'remain' ? d.remain_abs : d.leave_abs;
	var loser_abs = WINNER === 'remain' ? d.leave_abs : d.remain_abs;
	return winner_abs - loser_abs;
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
		.attr('class', 'turnout')
		.text('Turnout')
}
