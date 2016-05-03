//get the lookuptable and append region codes

var fs = require('fs');
var d3 = require('d3');
var ftDataFile = 'data/ft/lookup.csv';

var gssRef = d3.csv.parse( fs.readFileSync('data/ons/gss-code-reference.csv','utf-8'));
var ftData = d3.csv.parse( fs.readFileSync(ftDataFile, 'utf-8'));

var gssLookup = makeLookup(gssRef, 'LAD14CD');

ftData = ftData.map(function(d){
	if(gssLookup[d.ons_id]){
		d.ons_regional_id = gssLookup[d.ons_id].RGN14CD
	}
	return d;
});

fs.writeFileSync(ftDataFile, d3.csv.format(ftData))

function makeLookup(array, key){
	var lookup = {};
	array.forEach(function(d){
		lookup[ d[key] ] = d;
	})
	return lookup;
}