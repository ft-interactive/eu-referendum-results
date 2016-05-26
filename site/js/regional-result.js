let REGION_NAMES;

d3.csv('../data/ons/regions.csv', function (csv) {
	REGION_NAMES = csv;

	d3.xhr('http://localhost:8082/all', function (data) {

		if (data) {
			drawRegionalResultTable(JSON.parse(data.response).regional);
		}
		else {
			d3.json('dummyresult/regional.json', drawRegionalResultTable);
		}
	})	
});

function drawRegionalResultTable(results) {
	let table = d3.select('.regional-result').append('table');
	makeHeaders(table);

	// maxAbsolute is the largest bar we have in either direction
	let maxAbsolute = d3.max(results, function (d) {
		return Math.abs(getAbsMargin(d));
	});

	// Largest winning bar
	let max = d3.max(results, function (d) {
		return getAbsMargin(d);
	});

	// Largest losing bar
	let min = Math.abs(d3.min(results, function (d) {
		return getAbsMargin(d);
	}));

	table
		.selectAll('table>tr')
		.data(results.sort(function (first, second) {
			return getAbsMargin(second) - getAbsMargin(first)
		}))
		.call(function(join) {
			let rows = join.enter().append('tr');

			// Region name
			rows.append('td')
				.attr('class', 'region')
				.text(function (d) {
					let region = REGION_NAMES.find(function (region) {
						return region.id === d.region_id;
					});
					return region.name;
				});

			// Result % column
			rows.append('td')
				.attr('class', 'result')
				.style('background-color', function (d) {
					let color = d3.scale.threshold()
					    .domain([0])
					    .range([LOSE_BLUE,WIN_BLUE]);

					return color(getAbsMargin(d));
				})
				.style('color', 'white')
				.text(function (d) {
					let winner_pct = d.remain_pct > d.leave_pct ? d.remain_pct : d.leave_pct;
					return Math.round(winner_pct) + '%';
				});

			// Result column
			let difference = rows.append('td')
				.attr('class', 'margin')
				.append('ul')
				.attr('class', 'container');

			// Margin Absolute number
			difference
				.append('li')
				.style('flex-basis', function (d) {

					// text for dark blue bar, winning side
					if (getAbsMargin(d) > 0) {
						return Math.round(min * 100 / (max+min)) + '%'
					}
					else {					
						return Math.round(max * 100 / (max+min)) + '%'
					}
				})
				.attr('class', function (d) {
					return getAbsMargin(d) > 0 ? 'left-item item' : 'right-item item' ;
				})
				.append('div')
				.attr('class', function (d) {
					return getAbsMargin(d) > 0 ? 'result-text push-right' : 'result-text push-left';
				})
				.text(function (d) {
					return Math.abs(getAbsMargin(d)).toLocaleString();
				});

			// Margin Bar
			difference
				.append('li')
				.style('flex-basis', function (d) {
					// dark blue bar, winning side
					if (getAbsMargin(d) > 0) {
						console.log('d', Math.round(max * 100 / (max+min)))
						return Math.round(max * 100 / (max+min)) + '%'
					}
					else {					
						console.log('d',Math.round(min * 100 / (max+min)))
						return Math.round(min * 100 / (max+min)) + '%'
					}
				})
				.attr('class', function (d) {
					return getAbsMargin(d) > 0 ? 'right-item item' : 'left-item item' ;
				})
				.append('div')
				.attr('class', function (d) {
					return 'result-bar' + ' ' + (getAbsMargin(d) > 0 ? '' : 'push-right');
				})
				.style('right', function (d) {
					// light blue bar, losing side
					if (getAbsMargin(d) < 0) {
						console.log('d', Math.round(max * 100 / (max+min)))
						return Math.round(max * 100 / (max+min)) + '%'
					}
				})
				.style('background-color', function (d) {

					let color = d3.scale.threshold()
					    .domain([0])
					    .range([LOSE_BLUE,WIN_BLUE]);

					return color(getAbsMargin(d));
				})
				.style('width', function (d) {
					// relative to ul
					return Math.abs((getAbsMargin(d))/maxAbsolute) * 100 / 2 + '%'
				})
				// .style('left', function (d) {
				// 	return getAbsMargin(d) > 0 ? '500' : '';
				// });
			

			let maxTurnout = d3.max(results, function (d) {
				return d.turnout_abs;
			});

			let grayscale = d3.scale.linear()
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

function getAbsMargin (d) {
	let winner_abs = WINNER === 'remain' ? d.remain_abs : d.leave_abs;
	let loser_abs = WINNER === 'remain' ? d.leave_abs : d.remain_abs;
	return winner_abs - loser_abs;
}

function makeHeaders (table) {
	let row = table
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
