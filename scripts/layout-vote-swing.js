'use strict';

const d3 = require('d3');
const colours = require('./colours.json');
const leaveLabel = 'LEAVE';
const remainLabel = 'REMAIN';
const commas = d3.format('0,000');

module.exports = function(regionalResult){

    regionalResult = regionalResult.map(function(d){
		d.margin_abs = d.remain_abs - d.leave_abs
		return d;
	}).sort(function(a,b){
		return a.margin_abs - b.margin_abs;
	});
	
	let width = 800;
	let height = 400;
	let margin = {
		top:0, left:180, bottom:5, right:5,
	}
	let plotWidth = width - (margin.left + margin.right);
	let plotHeight = height - (margin.top + margin.bottom);
	let domain = d3.extent(regionalResult, function(d){ //if remain is greater the result is +ve
		return d.margin_abs;
	});
	
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
						 
		return {
			groupTransform: 'translate(0, ' + regionScale(i) + ')',
			barX: x,
			barY: regionScale(0.1),
			barWidth: w,
			barHeight: regionScale(0.8),
			barFill: fill,
			valueLabel: commas( Math.abs(d.margin_abs) ),
			valueLabelAnchor: valueAnchor,
			valueLabelTransform: 'translate(' + barScale(0) + ',0)',
			valueLabelDx: valueDx,
			valueLabelDy: regionScale(0.7),
			regionLabel: d.name,
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
    };
};