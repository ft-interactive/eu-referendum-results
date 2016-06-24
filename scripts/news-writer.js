'use strict';

const d3 = require('d3');
const commas = d3.format('0,000');

module.exports = function (national, regional, local){
 
    let headline = '';
    let winner = '';
    
    let margin = national.leave_percentage_share - national.remain_percentage_share;
    let votes_margin = national.leave_votes - national.remain_votes;
    if(national.number_of_results < national.total_voting_areas){
        if(margin > 0){
            winner = 'leave';
            headline = 'Leave lead the count';
        }else{
            winner = 'remain';
            headline = 'Remain lead the count';
        }
    }else{
        if(margin > 0){
            winner = 'leave';
            headline = 'Britons vote to leave the EU';
        }else{
            winner = 'remain';
            headline = 'Britons vote to remain in the EU';
        }
    }

    let marginStatement = '';
    if(national.number_of_results < national.total_voting_areas){
        marginStatement = `With ${national.number_of_results} areas of ${national.total_voting_areas} counted the ${winner} camp lead by ${commas( Math.abs(votes_margin) )}&nbsp;votes`;
    }else{
        marginStatement = `The <span class="${winner}-highlight">${winner}</span> camp has won the day by ${commas( Math.abs(votes_margin) )}&nbsp;votes`;
    }

    let mostLeave = 'Strongest <span class="leave-highlight">leave</span> vote: ' + getMostLeave( local, 3 ).map(function(d){
        return '<br><span class="place-detail">' + d.name + ' <span class="inline-value">'+d3.round(d.leave_percentage_share,1)+'</span>%</span>';
    }).join('');
    
    let mostRemain = 'Strongest <span class="remain-highlight">remain</span> vote: ' + getMostRemain( local, 3 ).map(function(d){
        return '<br><span class="place-detail">' + d.name + '&nbsp;<span class="inline-value">'+d3.round(d.remain_percentage_share,1)+'</span>%</span>';
    }).join('');


    let turnoutExtent = 'from ' + getTurnoutExtent(local).map(function(d,i){
        return '<span class="inline-value">' + d3.round(d.turnout_pct,1) + '</span>% (' + d.name + ')';
    }).join(' to '); 

    //let turnoutStatement = 'Overall turnout was ' + turnoutDescription(national.turnout_pct) + ' at <span class="inline-value">'+d3.round(national.turnout_pct,1)+'</span>% locally it varied ' + turnoutExtent;
    //removed turnout statement <li>${turnoutStatement}</li>
    return {
        headline: headline,
        marginStatement: `<h2 class="o-typography-subhead">${marginStatement}</h2>`, 
        leaveRemainExtremes: `<div data-o-grid-colspan="6">${mostRemain}</div><div data-o-grid-colspan="6">${mostLeave}</div>`,
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
        sorted[0],
        sorted[ sorted.length - 1 ]
    ];
}

function getMostLeave(data, n){
    let sorted = data.sort(function(a,b){
        return b.leave_percentage_share - a.leave_percentage_share;
    });
    return sorted.slice(0, n).filter(isNullResult);
}

function getMostRemain(data, n){
    let sorted = data.sort(function(a,b){
        return b.remain_percentage_share - a.remain_percentage_share;
    });
    return sorted.slice(0, n).filter(isNullResult);
}

function isNullResult(d){
    return !(d.leave_percentage_share === 0 || d.leave_percentage_share === null);
}