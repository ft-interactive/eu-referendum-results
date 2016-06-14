
const d3 = require('d3');
const colours = require('./colours.json')

module.exports = function(data){
    const nationalResultArray = [
		{
			label: '<span class="national-figure">' + d3.round(data.leave_percentage_share,1) + '%</span> LEAVE',
			value_pct:data.leave_percentage_share,
			value_abs:data.leave_votes,
			colour:colours.leaveColour,
		},
		{
			label: '<span class="national-figure">' + d3.round(data.remain_percentage_share,1) + '%</span> REMAIN',
			value_pct:data.remain_percentage_share,
			value_abs:data.remain_votes,
			colour:colours.remainColour,
		}
	]
    .sort(function(a, b){
        return b.value_pct - a.value_pct;
    });
	
    return {
        results: nationalResultArray,
    };
}