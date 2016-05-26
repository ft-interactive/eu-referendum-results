'use strict';

d3.xhr('http://localhost:8082/all', function (data) {
	console.log('data', data);

	if (data) {
		drawNationalResults(false, JSON.parse(data.response).national);
	}
	else {
		d3.json('dummyresult/national.json', drawNationalResults);
	}
});

function drawNationalResults(error, data) {

	let winningPct = Math.round(Math.max(data.leave_pct, data.remain_pct));

	let result = d3.select('.national-result').append('div');

	let container = result.append('ul').attr('class', 'national-container');

	for (let result of ['leave', 'remain']) {

		let thisPct = Math.round(data[`${result}_pct`]);
		
		container
			.append('li')
			.attr('class', 'national-item' + (winningPct === thisPct ? ' win' : ' lose'))
			.append('div')
			.attr('class', 'total-bar')
			.text(`${window.RESULT_LABEL[result]} ${thisPct}'%`)
			.style('background-color', winningPct === thisPct ? WIN_BLUE : LOSE_BLUE)
			.style('width', thisPct * 100 / winningPct + '%');

		if (winningPct === thisPct) {
			window.WINNER = result;
		}
	}
}
