var MAX_BAR_WIDTH = 100;

d3.json('dummyresult/national.json', drawNationalResults);

function drawNationalResults(error, data) {
	console.log('national', error, data)
	var result = d3.select('.national-result').append('div').attr('class', 'national-container');

	var winner = Math.max(data.leave_pct, data.remain_pct);

	result
		.append('div')
		.attr('class', 'total-bar remain' + (winner === data.remain_pct ? ' winner': ''))
		.text(STAY_LABEL + ' ' + Math.round(data.remain_pct) + '%')
		.style('background-color', STAY_COLOR)
		.style('width', data.remain_pct * MAX_BAR_WIDTH / winner + '%');

	result
		.append('div')
		.attr('class', 'total-bar leave' + (winner === data.leave_pct ? ' winner': ''))
		.text(LEAVE_LABEL + ' ' + Math.round(data.leave_pct) + '%')
		.style('background-color', LEAVE_COLOR)
		.style('width', data.leave_pct * MAX_BAR_WIDTH / winner  + '%');
}
