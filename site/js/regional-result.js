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
		HTMLaccessor:function(d){ 
			var spanOpen = '<div>';
			if(d.leave_pct>=50){
				spanOpen = '<div style="background:'+ leaveColour +'; color:white;">';
			}
			return spanOpen + d.leave_pct.toFixed(1) + '%</div>'; 
		},
	},
	{
		heading:'Remain',
		class:'table-number',
		HTMLaccessor:function(d){ 
			var spanOpen = '<div>';
			if(d.remain_pct>=50){
				spanOpen = '<div style="background:'+ remainColour +'; color:white;">'
			}
			return spanOpen + d.remain_pct.toFixed(1) + '%</div>'; 
		},
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
}

