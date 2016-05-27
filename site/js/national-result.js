'use strict';

let NATIONAL_BAR_WIDTH = 50;
let DECIMALS_ON_50_50 = false;

d3.xhr('http://localhost:8082/all', function (data) {

	if (data) {
		drawNationalResults(false, JSON.parse(data.response).national);
	}
	else {
		d3.json('dummyresult/national.json', drawNationalResults);
	}
});

function drawNationalResults(error, data) {

	let winningPct = Math.max(data.leave_pct, data.remain_pct);

	let result = d3.select('.national-result').append('div');

	let container = result.append('ul').attr('class', 'national-container');

	for (let result of ['leave', 'remain']) {

		let thisPct = data[result + '_pct'];
		let resultLabel;

		if (DECIMALS_ON_50_50) {
			resultLabel = `${RESULT_LABEL[result]} ${(Math.round(thisPct) === 50 ? Math.round(thisPct*10)/10 : Math.round(thisPct))}%`;
		}
		else {
			resultLabel = `${RESULT_LABEL[result]} ${Math.round(thisPct)}%`;
		}
		
		let barContainer = container
			.append('li')
			.attr('class', 'national-item' + (winningPct === thisPct ? ' win' : ' lose'));

			console.log(thisPct, winningPct)

		barContainer
			.append('div')
			.attr('class', 'total-bar')
			.style('background-color', winningPct === thisPct ? WIN_BLUE : LOSE_BLUE)
			.style('width', thisPct * NATIONAL_BAR_WIDTH / winningPct + '%');

		barContainer
			.append('div')
			.attr('class', 'total-bar-label')
			.text(resultLabel);

		if (winningPct === thisPct) {
			window.WINNER = result;
		}
	}
}
