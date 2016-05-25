var REGION_NAMES;

d3.csv('../data/ons/regions.csv', function (csv) {
	REGION_NAMES = csv;

	d3.json('dummyresult/regional.json', drawRegionalResultTable);
})

function drawRegionalResultTable(results) {
	var table = d3.select('.regional-result').append('table');
	makeHeaders(table);

	// maxAbsolute is the largest bar we have in either direction
	var maxAbsolute = d3.max(results, function (d) {
		return Math.abs(getAbs(d));
	});
	var max = d3.max(results, function (d) {
		return getAbs(d);
	});
	var min = Math.abs(d3.min(results, function (d) {
		return getAbs(d);
	}));

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

			// Result % column
			rows.append('td')
				.attr('class', 'result')

				// COLORS
				.style('background-color', function (d) {
					var color = d3.scale.threshold()
					    .domain([0])
					    .range([LOSE_BLUE,WIN_BLUE]);

					return color(getAbs(d));
				})
				.style('color', 'white')

				// GLOBAL WINNER % ONLY 
				// .text(function (d) {
				// 	var winner_pct = WINNER === 'remain' ? d.remain_pct : d.leave_pct;
				// 	console.log(winner_pct, WINNER, d.remain_pct, d.leave_pct)
				// 	return Math.round(winner_pct) + '%';
				// });

				// REGIONAL WINNER % FOR EACH
				.text(function (d) {
					var winner_pct = d.remain_pct > d.leave_pct ? d.remain_pct : d.leave_pct;
					return Math.round(winner_pct) + '%';
				});

			// Result column
			var difference = rows.append('td')
				.attr('class', 'margin')
				.append('ul')
				.attr('class', 'container');

			// Margin Absolute number
			difference
				.append('li')
				.style('flex-basis', function (d) {

					// text for dark blue bar, winning side
					if (getAbs(d) > 0) {
						console.log('d', Math.round(max * 100 / (max+min)))
						return Math.round(min * 100 / (max+min)) + '%'
					}
					else {					
						console.log('d',Math.round(min * 100 / (max+min)))
						return Math.round(max * 100 / (max+min)) + '%'
					}
				})
				.attr('class', function (d) {
					return getAbs(d) > 0 ? 'left-item item' : 'right-item item' ;
				})
				.append('div')
				.attr('class', function (d) {
					return getAbs(d) > 0 ? 'result-text push-right' : 'result-text push-left';
				})
				.text(function (d) {
					return Math.abs(getAbs(d)).toLocaleString();
				});

			// Bar
			difference
				.append('li')
				.style('flex-basis', function (d) {
					// dark blue bar, winning side
					if (getAbs(d) > 0) {
						console.log('d', Math.round(max * 100 / (max+min)))
						return Math.round(max * 100 / (max+min)) + '%'
					}
					else {					
						console.log('d',Math.round(min * 100 / (max+min)))
						return Math.round(min * 100 / (max+min)) + '%'
					}
				})
				.attr('class', function (d) {
					return getAbs(d) > 0 ? 'right-item item' : 'left-item item' ;
				})
				.append('div')
				.attr('class', function (d) {
					return 'result-bar' + ' ' + (getAbs(d) > 0 ? '' : 'push-right');
				})
				.style('right', function (d) {
					// light blue bar, losing side
					if (getAbs(d) < 0) {
						console.log('d', Math.round(max * 100 / (max+min)))
						return Math.round(max * 100 / (max+min)) + '%'
					}
				})
				.style('background-color', function (d) {

					var color = d3.scale.threshold()
					    .domain([0])
					    .range([LOSE_BLUE,WIN_BLUE]);

					return color(getAbs(d));
				})
				.style('width', function (d) {
					// relative to ul
					return Math.abs((getAbs(d))/maxAbsolute) * 100 / 2 + '%'
				})
				// .style('left', function (d) {
				// 	return getAbs(d) > 0 ? '500' : '';
				// });
			

			var maxTurnout = d3.max(results, function (d) {
				return d.turnout_abs;
			});

			console.log(maxTurnout);
			var grayscale = d3.scale.threshold()
			    .domain([1000000, 2000000, 3000000])
			    .range(['white','grey','black']);

			var grayscale = d3.scale.linear()
			    .domain([0,maxTurnout])
			    .range(['#ccc','#222']);

			// Turnout column
			rows.append('td')
				.style('text-align', 'right')
				.attr('class', 'turnout')
				.style('background-color', function (d) {
					return grayscale(d.turnout_abs) 
				})
				.text(function (d) {
					// return (Math.round(d.turnout_abs/100000)/10).toLocaleString().replace('0.', '.') + 'M';
					return (Math.round(d.turnout_abs/1000)/1).toLocaleString() + 'K';
				});
			}
		);
}

function getAbs (d) {
	var winner_abs = WINNER === 'remain' ? d.remain_abs : d.leave_abs;
	var loser_abs = WINNER === 'remain' ? d.leave_abs : d.remain_abs;
	return winner_abs - loser_abs;
}

function getPct (d) {
	var winner_pct = WINNER === 'remain' ? d.remain_pct : d.leave_pct;
	var loser_pct = WINNER === 'remain' ? d.leave_pct : d.remain_pct;
	return winner_pct - loser_pct;
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
		.text('Result**')
	row
		.append('th')
		.text('Margin')
	row
		.append('th')
		.attr('class', 'turnout')
		.text('Votes')
}
