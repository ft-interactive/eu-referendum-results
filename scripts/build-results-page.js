'use strict';

//config
const config = require('./config.json');

//dependencies
const fs = require('fs');
const nunjucks = require('nunjucks');
const d3 = require('d3');


const layoutVoteSwing = require('./layout-vote-swing.js');
const layoutNationalBars = require('./layout-national-bars.js');
const writer = require('./news-writer.js');
const topoData = require('./geodata/referendum-result-areas.json');
console.log(config)
//HTML build
const regionalResults = loadLocalJSON( config.regionalResult )
    .map(function(d){
        return {
            remain_votes: d.remain_votes,
            leave_votes: d.leave_votes,
            short_name: d.short_name,
            id: d.id,
            state: d.state,
            remain_percentage_share: d3.round(d.remain_percentage_share,1),
            leave_percentage_share: d3.round(d.leave_percentage_share,1),
        };
    });

const nationalResults = loadLocalJSON( config.nationalResult );

const localResuls = loadLocalJSON( config.localResult )    
    .map(function(d){
        return {
            name: d.name,
            ons_id: d.ons_id,
            region_id: d.region_id,
            remain_percentage_share: d3.round(d.remain_percentage_share, 1),
            remain_votes: d.remain_votes,
            leave_percentage_share: d3.round(d.leave_percentage_share, 1),
            leave_votes: d.leave_votes,
            state: d.state,
        };
    });

const words = writer(nationalResults, regionalResults, localResuls);

nunjucks.configure('templates', { autoescape: false });

const nationalResultChart = nunjucks.render('national-result-chart.html', layoutNationalBars( nationalResults));
const regionalBreakdownChart = nunjucks.render('vote-swing.svg', layoutVoteSwing( regionalResults ));

const context = {
    datetime: String(new Date()),
    headline: words.headline,
    marginStatement: words.marginStatement,
    leaveRemainExtremes: words.leaveRemainExtremes,
//    standfirstList: words.standfirstList,
    topoData: JSON.stringify( topoData ),
    localResultData: JSON.stringify( localResuls ),
    regionalResultData: JSON.stringify( regionalResults ),
    nationalResultData: JSON.stringify( nationalResults ),
    nationalResultChart: nationalResultChart,
    regionalBreakdownChart: regionalBreakdownChart,
};

const indexHTML = nunjucks.render( 'index.html', context );
const homepageWidget = nunjucks.render( 'homepage-widget.html', {data:nationalResults, orderedData:layoutNationalBars( nationalResults )} );

fs.writeFileSync( config.outputLocation + 'index.html', indexHTML );
fs.writeFileSync( config.outputLocation + 'homepage-widget.html', homepageWidget );

//Javascript build
const writeStream = fs.createWriteStream(config.outputLocation + 'js/bundle.js')
const browserify = require('browserify');
browserify('./browser-js/main.js')
    .exclude('d3')
    .bundle()
    .pipe(writeStream);

//utitlity functions

function loadLocalJSON(filename){
    console.log(filename)
    return JSON.parse( fs.readFileSync( filename, 'utf-8' ) );
}

function makeLookup(array, key){
    return array.reduce(function(prev, current, i, a){
        prev[ current[key] ] = current;
        return prev;
    }, {});
}