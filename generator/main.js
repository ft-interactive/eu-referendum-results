'use strict'

var http = require('http');
var fs = require('fs');
var d3DSV = require('d3-dsv');
var d3Random = require('d3-random');

var PORT=8082; 

var leave = d3Random.randomNormal(0.49, 0.1);
var turnout = d3Random.randomNormal(0.5, 0.05);

function generateLeave(){
    return clip( leave() );
}

function generateTurnout(){
    return clip( turnout() );
}

function clip(val){
    if (val > 1) return 1;
    if (val < 0) return 0;
    return val;
}

//We need a function which handles requests and send response
function handleRequest(request, response){
    response.setHeader( "Access-Control-Allow-Origin", "*" );
    if (request.url == '/national') response.end(JSON.stringify( nationalResult() ));
    if (request.url == '/regional') response.end(JSON.stringify( regionalResult() ));
    if (request.url == '/all'){
	var local = localResult();
	var regional = regionalResult(local);
	var national = nationalResult(local);
	response.end(JSON.stringify( {
		    local:local,
			regional:regional,
			national:national
			} ));    
    }
    if (request.url == '/all-lookup'){
	var local = localResult();
	var regional = regionalResult(local);
	var national = nationalResult(local);
	response.end(JSON.stringify( {
		    local:local.reduce(function(previousValue, currentValue){
			    previousValue[currentValue.local_id] = currentValue;
			    return previousValue;
			}, {}),
			regional:regional.reduce(function(previousValue, currentValue){
				previousValue[currentValue.region_id] = currentValue;
				return previousValue;
			    }, {}),
			national:national
			} ));    
    }
    response.end(JSON.stringify( localResult() ));
}


var pop = d3DSV.csvParse(fs.readFileSync('populations.csv','utf-8'));

var electorate = pop.reduce(function(previousValue, currentValue){
	previousValue[currentValue.code] = currentValue.electorate;
	return previousValue;
    }, {});

var data = d3DSV.csvParse(fs.readFileSync('lookup.csv','utf-8'))
    .map(function(d){
	    d.electorate = electorate[d.ons_id];
	    return d;
	});

function localResult(){
    return data.map(function(d){
	    var turnout = generateTurnout();
	    var leave = generateLeave();

	    var voters = Math.round( d.electorate * turnout );
	    var leaveVoters = Math.round(voters*leave);
	    var remainVoters = voters - leaveVoters;
	    return {
		local_id: d.ons_id,
		    region_id: d.ons_regional_id,
		    type: 'local',
		    electorate: parseInt(d.electorate),

		    turnout_abs: voters,
		    leave_abs: leaveVoters,
		    remain_abs: remainVoters,

		    turnout_pct: turnout * 100,
		    leave_pct: leave*100,
		    remain_pct: 100 - leave * 100,
		    };
	});
}

function regionalResult(r){
    if(!r) r = localResult();

    var rollup = r.reduce(function(previousValue, currentValue){
	    if(previousValue[currentValue.region_id] === undefined){
		previousValue[currentValue.region_id] = {
		    type:'region',
		    region_id:currentValue.region_id,
		    electorate:0,
		    turnout_abs:0,
		    leave_abs:0,
		    remain_abs:0,
		};
	    }

	    previousValue[currentValue.region_id].electorate += currentValue.electorate;
	    previousValue[currentValue.region_id].turnout_abs += currentValue.turnout_abs;
	    previousValue[currentValue.region_id].leave_abs += currentValue.leave_abs;
	    previousValue[currentValue.region_id].remain_abs += currentValue.remain_abs;

	    return previousValue;
	},{})

	return values( rollup ).map(function(d){
		d.turnout_pct = (d.turnout_abs/d.electorate) * 100;
		d.leave_pct = (d.leave_abs/d.turnout_abs) * 100;
		d.remain_pct = (d.remain_abs/d.turnout_abs) * 100;
		return d;
	    });
}

function nationalResult(r){
    if(!r) r = localResult();

    var result = r.reduce(function(previousValue, currentValue){
	    previousValue.electorate += currentValue.electorate;
	    previousValue.turnout_abs += currentValue.turnout_abs;
	    previousValue.leave_abs += currentValue.leave_abs;
	    previousValue.remain_abs += currentValue.remain_abs;
	    return previousValue;
	},
	{
	    type:'nation',
	    electorate:0,
	    turnout_abs:0,
	    leave_abs:0,
	    remain_abs:0,
	});

    result.turnout_pct = (result.turnout_abs/result.electorate) * 100;
    result.leave_pct = (result.leave_abs/result.turnout_abs) * 100;
    result.remain_pct = (result.remain_abs/result.turnout_abs) * 100;

    return result;
}

function values(o){
    return Object.keys(o).map(function(key){
	    return o[key];
	});
}

//Create a server 

var server = http.createServer(handleRequest);
server.listen(PORT, function(){
	console.log("Server listening on: http://localhost:%s", PORT);
	//console.log(data);
    });