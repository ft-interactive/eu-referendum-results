var MAX_BAR_WIDTH = 100;

d3.json('dummyresult/national.json', drawNationalResults);

function drawNationalResults(error, data) {
	console.log('national', error, data)
	var result = d3.select('.national-result').append('div');

	var winningPct = Math.max(data.leave_pct, data.remain_pct);

	var container = result.append('ul').attr('class', 'national-container');

	for (var result of ['leave', 'remain']) {

		var thisPct = data[result + '_pct'];

		container
			.append('li')
			.attr('class', 'national-item' + (winningPct === thisPct ? ' win' : ' lose'))
			.append('div')
			.attr('class', 'total-bar')
			.text(RESULT_LABEL[result] + ' ' + Math.round(thisPct) + '%')
			.style('background-color', winningPct === thisPct ? WIN_BLUE : LOSE_BLUE)
			.style('width', thisPct * MAX_BAR_WIDTH / winningPct + '%');

		if (winningPct === thisPct) {
			WINNER = result;
		}
	}
}
