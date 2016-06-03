console.log('nation');

// TODO Shared variables
var leaveColour = '#093967';
var remainColour = '#6AADB3';
var leaveLabel = 'LEAVE';
var remainLabel = 'REMAIN';
var commas = d3.format('0,000');

//end shared

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
	addNationalSummary(nationalResultArray);
});

d3.json('dummyresult/regional-named.json', function(regionalResults){
	regionalResults = regionalResults.map(function(d){
		d.margin_abs = d.remain_abs - d.leave_abs
		return d;
	}).sort(function(a,b){
		return a.margin_abs - b.margin_abs;
	});
	
	var width = 800;
	var height = 400;
	var margin = {
		top:50, left:180, bottom:5, right:5,
	}
	var plotWidth = width - (margin.left + margin.right);
	var plotHeight = height - (margin.top + margin.bottom);
	var domain = d3.extent(regionalResults, function(d){ //if remain is greater the result is +ve
		return d.margin_abs;
	});
	
	var barScale = d3.scale.linear()
		.range([0,plotWidth])
		.domain(domain);
	
	var regionScale = d3.scale.linear()
		.range([0,plotHeight])
		.domain([0, regionalResults.length])
	
	var chartLayout = regionalResults.map(function(d, i){
		var x = barScale(d.margin_abs);
		var w = barScale( 0 ) - barScale( d.margin_abs );
		var fill = leaveColour;
		var valueAnchor = 'start';
		var valueDx = 5;
						
		if(d.margin_abs > 0){
			x = barScale( 0 );
			w = barScale( d.margin_abs ) - barScale( 0 );
			fill = remainColour;
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
	})
	
	var svg = d3.select('.regional-result.graphic')
		.append('svg')
			.attr({
				width:width,
				height:height,
				viewBox:'0 0 '+width+' '+height,
			})
			.append('g')
			.attr('transform','translate('+margin.left+','+margin.top+')');
	
	svg.selectAll('g')
		.data(chartLayout)
		.enter()
			.append('g')
			.attr('transform',function(d){ return d.groupTransform; })
			.call(function(parent){
				parent.append('line')
					.attr('class','regional-axis')
					.attr('x1', function(d){ return d.underline.x1; })
					.attr('y1', function(d){ return d.underline.y1; })
					.attr('x2', function(d){ return d.underline.x2; })
					.attr('y2', function(d){ return d.underline.y2; });
						
				parent.append('rect') //bar
					.attr('x', function(d){ return d.barX; })
					.attr('y', function(d){ return d.barY; })
					.attr('width', function(d){ return d.barWidth; })
					.attr( 'height', function(d){ return d.barHeight; })
					.attr( 'fill', function(d){ return d.barFill; });
					
				parent.append('text')
					.attr('class','vote-figure')
					.attr('text-anchor', function(d){ return d.valueLabelAnchor; })
					.attr('transform',function(d){ return d.valueLabelTransform; })
					.attr('dx',function(d){ return d.valueLabelDx; })
					.attr('dy',function(d){ return d.valueLabelDy; })
					.text(function(d){ return d.valueLabel; }); //number label
					
				parent.append('text')
					.attr('text-anchor','end')
					.attr('class','region-label')
					.attr('dy',function(d){ return d.regionLabelDy; })
					.attr('dx',function(d){ return d.regionLabelDx; })
					.text(function(d){ return d.regionLabel; }); //area name 
			});
	
	svg.append('line')
		.attr({
			'class':'regional-axis',
			x1:barScale(0),
			y1:-margin.top,
			x2:barScale(0),
			y2:plotHeight,
		});
			
	svg.append('text')
		.attr('transform','translate('+barScale(0)+',0)')
		.text('☜ leave votes ')
		.attr('class', 'bar-header')
		.attr('text-anchor','end')
		.attr('dy',-margin.top/2)
		.attr('dx',-10);
			
	svg.append('text')
		.attr('transform','translate('+barScale(0)+',0)')
		.text('remain votes ☞')
		.attr('class', 'bar-header')
		.attr('text-anchor','start')
		.attr('dy',-margin.top/2)
		.attr('dx',10);
	
});

function addNationalSummary(data) {
	d3.select('#national-summary')
		.html(	
			'The leave camp won the day by a XXX margin of N percent (N votes). '+  
			'list of regions which voted the other way, ranked ' +
			'<a href="">Turnout</a> was XXX at N% (N voters). There was XXX <a href="">variation between reporting areas</a>' + 
			'PLACE in REGION voting XX% to remain, PLACE in REGION XX% to leave.' 
		)
}

function drawNationalResults(data) {	 
	d3.select('.national-result-bars')
		.append('div')
			.attr('class', 'national-container')
		.selectAll('div')
			.data( data.sort(function(a,b){
				return (b.value_pct - a.value_pct);
			}) )
		.enter()
			.append('div')
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
