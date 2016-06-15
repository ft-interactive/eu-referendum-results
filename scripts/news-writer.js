'use strict';

const d3 = require('d3');
const commas = d3.format('0,000');

module.exports = function (national, regional, local, lookupByID){
    
    // console.log(national);
    // console.log(local);
    // console.log(regional);        
    let headline = '';
    let winner = '';
    
    let margin = national.leave_percentage_share - national.remain_percentage_share;
    let votes_margin = national.leave_votes - national.remain_votes;
    if(margin > 0){
        winner = 'leave';
        headline = 'Britons vote to leave the EU';
    }else{
        winner = 'remain';
        headline = 'Britons vote to remain in the EU';
    }

    let marginStatement = `The <span class="${winner}-highlight">${winner}</span> camp won the day by a ${marginDescription(margin)}, <span class="inline-value">${Math.abs(margin).toFixed(1)}</span>% ( <span class="inline-value">${commas( Math.abs(votes_margin) )}</span> votes )`;
    
    let mostLeave = 'The places which voted most strongly to <span class="leave-highlight">leave</span> were: ' + getMostLeave( local, 3 ).map(function(d){
        let name =  lookupByID[d.ons_id].name;
        return '<br><span class="place-detail">' + name + ' <span class="inline-value"><b>'+d3.round(d.leave_percentage_share,1)+'</b></span>%</span>';
    }).join('');
    
    let mostRemain = 'The places which voted most strongly to <span class="remain-highlight">remain</span> were: ' + getMostRemain( local, 3 ).map(function(d){
        let name =  lookupByID[d.ons_id].name;
        return '<br><span class="place-detail">' + name + ' <span class="inline-value"><b>'+d3.round(d.remain_percentage_share,1)+'</b></span>%</span>';
    }).join('');


    let turnoutExtent = 'from ' + getTurnoutExtent(local).map(function(d,i){
        return '<span class="inline-value">' + d3.round(d.turnout_pct,1) + '</span>% (' + lookupByID[d.ons_id].name + ')';
    }).join(' to '); 

    //let turnoutStatement = 'Overall turnout was ' + turnoutDescription(national.turnout_pct) + ' at <span class="inline-value">'+d3.round(national.turnout_pct,1)+'</span>% locally it varied ' + turnoutExtent;
    //removed turnout statement <li>${turnoutStatement}</li>
    return {
        headline: headline,
        standfirstList: `<ul class="standfirst-list"><li>${marginStatement}</li><li>${mostLeave}</li><li>${mostRemain}</li></ul>`,
    };
};

const marginDescription = d3.scale.threshold()
        .domain( [5, 10, 20, 100] )
        .range([
            'slim margin', 
            'comfortable margin', 
            'significant margin',
            'landslide' ]);
            
const turnoutDescription = d3.scale.threshold()
        .domain( [30, 50, 60, 100] )
        .range([
            'weak', 
            'low', 
            'reasonable',
            'strong' ]);

function getTurnoutExtent(data){
    let sorted = data.sort(function(a,b){
        return b.turnout_pct - a.turnout_pct;
    });
    
    return [
        sorted.shift(),
        sorted.pop()
    ];
}

function getMostLeave(data, n){
    let sorted = data.sort(function(a,b){
        return b.leave_percentage_share - a.leave_percentage_share;
    });
    return sorted.slice(0, n);
}

function getMostRemain(data, n){
    let sorted = data.sort(function(a,b){
        return b.remain_percentage_share - a.remain_percentage_share;
    });
    return sorted.slice(0, n);
}