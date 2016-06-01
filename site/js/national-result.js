'use strict';
console.log('nation');

var NATIONAL_BAR_WIDTH = 60;
var DECIMALS_ON_50_50 = true;

// TODO Shared variables
var leaveColour = '#093967';
var remainColour = '#6AADB3';
var leaveLabel = 'LEAVE';
var remainLabel = 'REMAIN';

var NARROW_PCT = 10; // Switch to NARROW_COLOR at 50% + NARROW_PCT


d3.json('dummyresult/national.json', function(data){
	
	//TODO shared data processing
	var nationalResultArray = [
		{
			label:leaveLabel + ' ' + d3.round(data.leave_pct,1) + '%',
			value_pct:data.leave_pct,
			value_abs:data.leave_abs,
			colour:leaveColour,
		},
		{
			label:remainLabel + ' ' + d3.round(data.remain_pct,1) + '%',
			value_pct:data.remain_pct,
			value_abs:data.remain_abs,
			colour:remainColour,
		}
	];
	drawNationalResults(nationalResultArray);
});


function drawNationalResults(data) {	 
	console.log(data);
//	var winningPct = Math.max(data.leave_pct, data.remain_pct);
	d3.select('.national-result')
		.append('div')
		.append('ul')
			.attr('class', 'national-container')
		.selectAll('li')
			.data( data.sort(function(a,b){
				return (b.value_pct - a.value_pct);
			}) )
		.enter()
			.append('li')
			.attr('class', function(d,i){
				if(i==0) return 'national-item win';
				return 'national-item lose';							
			})
			.call(function(parent){
				
				parent.append('div')
					.attr('class', 'total-bar')
					.style('background-color', function(d){ return d.colour; })
					.style('width', function(d){ return d.value_pct + '%'; });
					
				parent.append('div')
					.attr('class', 'total-bar-label')
					.text(function(d){
						return d.label;
					});
				});
}
