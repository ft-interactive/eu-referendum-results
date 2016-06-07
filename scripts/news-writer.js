const d3 = require('d3');
const commas = d3.format('0,000');



module.exports = function (national, regional, local, lookupByID){
    
    // console.log(national);
    // console.log(local);
    // console.log(regional);        
    let headline = '';
    let winner = '';
    
    let margin = national.leave_pct - national.remain_pct;
    let votes_margin = national.leave_abs - national.remain_abs;
    if(margin > 0){
        winner = 'leave';
        headline = 'Britons vote to leave the EU';
    }else{
        winner = 'remain';
        headline = 'Britons vote to remain in the EU';
    }

    let marginStatement = `The <span class="${winner}-highlight">${winner}</span> camp won the day by a ${marginDescription(margin)}, ${Math.abs(margin).toFixed(1)}% ( ${commas( Math.abs(votes_margin) )} votes )`;
    
    let mostLeave = 'The places which voted most strongly to <span class="leave-highlight">leave</span> were: ' + getMostLeave( local, 3 ).map(function(d){
        let name =  lookupByID[d.local_id].name;
        return name + ' ('+d3.round(d.leave_pct,1)+'%)';
    }).join(', ');;
    
    let mostRemain = 'The places which voted most strongly to <span class="remain-highlight">remain</span> were: ' + getMostRemain( local, 3 ).map(function(d){
        let name =  lookupByID[d.local_id].name;
        return name + ' ('+d3.round(d.remain_pct,1)+'%)';
    }).join(', ');


    let turnoutExtent = 'from ' + getTurnoutExtent(local).map(function(d,i){
        return d3.round(d.turnout_pct,1) + '% (' + lookupByID[d.local_id].name + ')';
    }).join(' to '); 
    
    console.log( turnoutExtent );

    let turnoutStatement = 'Overall turnout was ' + turnoutDescription(national.turnout_pct) + ' at '+d3.round(national.turnout_pct,1)+'% locally it varied ' + turnoutExtent;
    
    return {
        headline: headline,
        standfirstList: `<ul class="o-typography-body o-typography-list"><li>${marginStatement}</li><li>${mostLeave}</li><li>${mostRemain}</li><li>${turnoutStatement}</li></ul>`,
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
    console.log(data);
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
        return b.leave_pct - a.leave_pct;
    });
    return sorted.slice(0, n);
}

function getMostRemain(data, n){
    let sorted = data.sort(function(a,b){
        return b.remain_pct - a.remain_pct;
    });
    return sorted.slice(0, n);
}