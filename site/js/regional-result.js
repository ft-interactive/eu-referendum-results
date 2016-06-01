let REGION_NAMES;
const TURNOUT_IN_THOUSANDS = true;
// Shared variables
var leaveColour = '#093967';
var remainColour = '#6AADB3';
var RESULT_LABEL = {
  leave: 'LEAVE',
  remain: 'REMAIN'
}
var NARROW_PCT = 10; // Switch to NARROW_COLOR at 50% + NARROW_PCT

d3.csv('../data/ons/regions.csv', function (csv) {
	REGION_NAMES = csv;

	d3.xhr('http://localhost:8082/all', function (data) {

		if (data) {
			drawRegionalResultTable(JSON.parse(data.response).regional);
		}
		else {
			d3.json('dummyresult/regional.json', drawRegionalResultTable);
		}
	});
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
			return getAbsMargin(second) - getAbsMargin(first);
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
					return calculateFlexBasis(d, 'text', max, min);
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

			// Margin bars
			difference

				// Left and right sub-columns of Margin column
				.append('li')
				.style('flex-basis', function (d) {
					return calculateFlexBasis(d, 'bar', max, min);
				})
				.attr('class', function (d) {
					return getAbsMargin(d) > 0 ? 'right-item item' : 'left-item item' ;
				})

				// The bar
				.append('div')
				.attr('class', function (d) {
					return `result-bar ${(getAbsMargin(d) > 0 ? '' : 'push-right')}`;
				})
				.style('right', function (d) {

					let right;

					// Losing side gets right-alighed by full size of left column
					if (getAbsMargin(d) < 0) {
						right = `${Math.round(max * 100 / (max+min))}%`;
					}

					// Make sure neither side is too small
					return right < 10 ? 10 : right;
				})
				.style('background-color', function (d) {

					let color = d3.scale.threshold()
					    .domain([0])
					    .range([LOSE_BLUE,WIN_BLUE]);

					return color(getAbsMargin(d));
				})
				.style('width', function (d) {

					// relative to full ul, so divide by 2
					return `${Math.abs((getAbsMargin(d))/maxAbsolute) * 100 / 2}%`;
				});
			

			let maxTurnout = d3.max(results, function (d) {
				return d.turnout_abs;
			});

			// Turnout column
			rows.append('td')
				.style('text-align', 'right')
				.attr('class', 'turnout')
				.text(function (d) {

					return TURNOUT_IN_THOUSANDS ? 
						(Math.round(d.turnout_abs/1000)/1).toLocaleString() + 'K' :
						(Math.round(d.turnout_abs/100000)/10).toLocaleString().replace('0.', '.') + 'M';
				});
			}
		);
}

function getAbsMargin (d) {
	let winner_abs = WINNER === 'remain' ? d.remain_abs : d.leave_abs;
	let loser_abs = WINNER === 'remain' ? d.leave_abs : d.remain_abs;
	return winner_abs - loser_abs;
}

/**
 * Calculates the width (flexBasis) of both sides of the Margin colum
 * by generating a % value off of the largest bar on each side
 *
 * Example:
 *    Largest bar on the right (max) is a 242,084 margin
 *    Largest bar on the left (min) is a 61,463 margin
 *	  100% width is 303,547 so
 * 		- winning side will have a flexBasis of 80% (242,084 * 100 / 303,547)
 *		- losing side will have a flexBasis of 20% (61,463 * 100 / 303,547)
 **/
function calculateFlexBasis (d, type, max, min) {

	let flexBasis;

	if (getAbsMargin(d) > 0) {
		flexBasis = Math.round((type === 'bar' ? max : min) * 100 / (max+min));
	}
	else {					
		flexBasis = Math.round((type === 'bar' ? min : max) * 100 / (max+min));
	}

	// Make sure neither side is too small
	flexBasis = flexBasis < 10 ? 10 : flexBasis;
	flexBasis = flexBasis > 90 ? 90 : flexBasis;

	return `${flexBasis}%`;
}

function makeHeaders (table) {
	let row = table
		.append('thead')
		.append('tr');

	row
		.append('th')
		.text('Region name');
	row
		.append('th')
		.text('Result**');
	row
		.append('th')
		.text('Margin');
	row
		.append('th')
		.attr('class', 'turnout')
		.text('Votes');
}
