
const d3 = require('d3');
const colours = require('./colours.json')

module.exports = function(data){
    const nationalResultArray = [
		{
			label:'LEAVE ' + d3.round(data.leave_percentage_share,1) + '%',
			value_pct:data.leave_percentage_share,
			value_abs:data.leave_votes,
			colour:colours.leaveColour,
		},
		{
			label:'REMAIN ' + d3.round(data.remain_percentage_share,1) + '%',
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