'use strict';

const d3 = require('d3');
const colours = require('./colours.json');
const leaveLabel = 'LEAVE';
const remainLabel = 'REMAIN';
const commas = d3.format('0,000');

const state = {
  // No data
  NONE: 0,
  // Partial reports
  TURNOUT: 1,
  RUNNING_TOTAL: 1,
  // We know the outcome (Leave/Remain) but data is incomplete
  OUTCOME: 2,
  // we know the outcome and have all the data
  RESULT: 3,
  // we have the outcome but we have a message
  // from the PA saying corrections will follow
  RESULT_OLD: 4
}

module.exports = function(regionalResult){

    regionalResult = regionalResult.map(function(d){
		d.margin_abs = d.remain_votes - d.leave_votes;
		return d;
	}).sort(function(a,b){
		return a.margin_abs - b.margin_abs;
	});
	
	let width = 800;
	let height = 400;
	let margin = {
		top:80, left:180, bottom:5, right:5,
	}
	let plotWidth = width - (margin.left + margin.right);
	let plotHeight = height - (margin.top + margin.bottom);
	let domain = d3.extent(regionalResult, function(d){ //if remain is greater the result is +ve
		return d.margin_abs;
	});
	
	//symetrical domain

	domain = function(d){
		let extreme = Math.max(Math.abs(d[0]), Math.abs(d[1]));
		return [-extreme, extreme];
	}(domain)

	if(domain[0] === 0 && domain[1] === 0){
		domain = [-1,1];
	}

	let barScale = d3.scale.linear()
		.range([0,plotWidth])
		.domain(domain);
	
	let regionScale = d3.scale.linear()
		.range([0,plotHeight])
		.domain([0, regionalResult.length])

    let series = regionalResult.map(function(d, i){
		let x = barScale(d.margin_abs);
		let w = barScale( 0 ) - barScale( d.margin_abs );
		let fill = colours.leaveColour;
		let valueAnchor = 'start';
		let valueDx = 5;
						
		if(d.margin_abs > 0){
			x = barScale( 0 );
			w = barScale( d.margin_abs ) - barScale( 0 );
			fill = colours.remainColour;
			valueAnchor = 'end';
			valueDx = -5;
		}
		//if state is less than 3 then that means the counts of sub areas are incomplete
		let rowClass = 'count-complete';
		let valueLabel = commas( Math.abs(d.margin_abs) );
		if(d.state < state.RESULT){
			rowClass = 'count-incomplete';
			valueLabel = valueLabel += ' *';
		}	 

		return {
			groupTransform: 'translate(0, ' + regionScale(i) + ')',
			barX: x,
			barY: regionScale(0.1),
			barWidth: w,
			barHeight: regionScale(0.8),
			barFill: fill,
			completeClass: rowClass , 
			valueLabel: valueLabel,
			valueLabelAnchor: valueAnchor,
			valueLabelTransform: 'translate(' + barScale(0) + ',0)',
			valueLabelDx: valueDx,
			valueLabelDy: regionScale(0.7),
			regionLabel: d.short_name,
			regionLabelDx:-5,
			regionLabelDy:regionScale(0.7),
			underline:{
				x1:-margin.left,
				y1:regionScale(1),
				x2:plotWidth,
				y2:regionScale(1),
			},
		}
	});
    
    return {
        series: series,
        width: width,
        height: height,
        margin: margin,
		axisLineX:barScale(0),
		axisLineYStart:-35,
		superTitleY:30,
		axisLineYEnd:height,
    };
};