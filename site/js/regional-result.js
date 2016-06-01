let REGION_NAMES;
const TURNOUT_IN_THOUSANDS = true;
// Shared variables
console.log('regions');

// TODO Shared variables
var leaveColour = '#093967';
var remainColour = '#6AADB3';
var leaveLabel = 'LEAVE';
var remainLabel = 'REMAIN';

//end shared

var tableStructure = [{
		heading:'Region',
		class:'',
		HTMLaccessor:function(d){ return d.name },
	},
	{
		heading:'Leave',
		class:'table-number',
		HTMLaccessor:function(d){ return d.leave_pct.toFixed(1) + '%'; },
	},
	{
		heading:'Remain',
		class:'table-number',
		HTMLaccessor:function(d){ return d.remain_pct.toFixed(1) + '%'; },
	},
	{
		heading:'Margin',
		class:'',
		HTMLaccessor:function(d){ return d.leave_abs +' vs '+ d.remain_abs; },
	},
	{
		heading:'Turnout',
		class:'table-number',
		HTMLaccessor:function(d){ console.log(d); return d.turnout_abs + ' (' + d.turnout_pct.toFixed(1) + '%)'; }
	}];
	
d3.json('dummyresult/regional-named.json', drawRegionalResultTable);


function drawRegionalResultTable(regionalResults) {
	console.log(regionalResults)
	var domain = d3.extent(regionalResults, function(d){
		return d.remain_abs - d.leave_abs;
	});
	
	var table = d3.select('.regional-result')
		.append('table');
	
	//heading	
	table.append('thead').append('tr')
		.selectAll('td')
			.data(tableStructure)
		.enter()
			.append('th')
			.attr('class',function(d){ return d.class; })
			.text(function(d){ return d.heading; })
	
	//rows
	table.append('tbody')
		.selectAll('tr')
			.data(regionalResults)
		.enter()
			.append('tr')
		.call(function(parent){
			parent
				.selectAll('td')
					.data(tableStructure)
				.enter()
					.append('td')
					.attr('class', function(d){
						return d.class;
					})
					.html(function(d, i ,j){
						return d.HTMLaccessor( regionalResults[j] );
					})
		});
	

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
