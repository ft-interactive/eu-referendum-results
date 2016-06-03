const d3 = require('d3');
var commas = d3.format('0,000');

const marginDescription = d3.scale.threshold()
        .domain([5, 10, 20, 100])
        .range([
            'slim margin', 
            'comfortable margin', 
            'significant margin',
            'landslide']);

module.exports = function (national, local, regional){
    
    console.log(national);
    
    let headline = '';
    let winner = '';
    
   
    let turnoutStatement = '';
    let regionalDifferencesStatement = '';

    
    let margin = national.leave_pct - national.remain_pct;
    let votes_margin = national.leave_abs - national.remain_abs;
    if(margin > 0){
        winner = 'leave';
        headline = 'Britons vote to leave the EU';
    }else{
        winner = 'remain';
        headline = 'Britons vote to remain in the EU';
    }
    
    let marginStatement = `The ${winner} camp won the day by a ${marginDescription(margin)}, ${Math.abs(margin).toFixed(1)}% ( ${commas( Math.abs(votes_margin) )} votes )`
    
    return {
        headline: headline,
        standfirstList: `<ul><li>${marginStatement}</li><li>standfirstList</li><li>standfirstList</li><li>standfirstList</li></ul>`,
    }
}

