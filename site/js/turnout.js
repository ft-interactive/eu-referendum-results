'use strict';

d3.xhr('http://localhost:8082/all', function (data) {
	if (data) {
		drawTurnout(Math.round(JSON.parse(data.response).national.turnout_pct));
	}
	else {
		drawTurnout(50);
	}
});

function drawTurnout(brexitTurnout) {

	d3.csv('../data/turnout.csv', function (result) {

		// Sort by date, ascending
		result.sort(function (a, b) {
			return Date.parse(a.date) - Date.parse(b.date);
		});

		d3.select('.turnout-results')
			.append('div')
			.attr('id', 'turnoutChart');

		let turnout = ['Turnout'];
		let date = ['x'];
		let election = ['election'];

		for (const row in result) {
			turnout.push(result[row].turnout);
			date.push(result[row].date);
			election.push(result[row].election);
		}

		let chart = c3.generate({
			bindto: '#turnoutChart',
			point: {
				r: function(d) {
					// return turnout[d.index + 1]/10 + '%';
					return d.value/2;
				},
				focus: {
					expand: {
						enabled: false
					}
				}
			},
			legend: {
				show: false
			},
			data: {
				type: 'scatter',
				colors: {
					Turnout: window.LOSE_BLUE
				},
				x: 'x',
				columns: [date, turnout],
				axes: {
				},
				types: {
				}
			},
			axis: {
				y: {
					label: { 
						text: 'Turnout %',
						position: 'inner-bottom'
					},
					padding: {
						top: 0, bottom: 0
					},
					max: 100,
					min: 30
				},
				x: {
					label: { 
						text: 'Election year',
					},
					tick: {
						type: 'timeseries',
						rotate: 0,
						multiline: false,
					},
					type: 'category'
				}
			},

			grid: {
				y: {
					lines: [{
						value: brexitTurnout,
						text: `UK EU Referendum 2016`,
						position: 'end'
					}]
				}
			},
			tooltip: {
				format: {
					title: function (d) {
						return election[d];
					},
					value: function (value, ratio, id) {
						return `${Math.round(value)}%`;
					}
				}
			}
		});
	});

}