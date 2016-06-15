'use strict';

//config
const outputLocation = '../site/';
const dumyDataLocation = '../site/dummyresult/old/';
const resultsLocation = '../site/dummyresult/';

//dependencies
const fs = require('fs');
const nunjucks = require('nunjucks');
const d3 = require('d3');


const layoutVoteSwing = require('./layout-vote-swing.js');
const layoutNationalBars = require('./layout-national-bars.js');
const writer = require('./news-writer.js');
const topoData = require('./geodata/referendum-result-areas.json');

//HTML build
const regionalResults = loadLocalJSON( resultsLocation + 'regions.json' )
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

const nationalResults = loadLocalJSON( resultsLocation + 'running-totals.json' );

const localResuls = loadLocalJSON( resultsLocation + 'voting-areas.json')    
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

const lookupByID = makeLookup( loadLocalCSV( './data/names.csv' ), 'ons_id');
const words = writer(nationalResults, regionalResults, localResuls, lookupByID);

nunjucks.configure('templates', { autoescape: false });

const nationalResultChart = nunjucks.render('national-result-chart.html', layoutNationalBars( nationalResults));
const regionalBreakdownChart = nunjucks.render('vote-swing.svg', layoutVoteSwing( regionalResults ));

const context = {
    datetime: String(new Date()),
    headline: words.headline,
    standfirstList: words.standfirstList,
    topoData: JSON.stringify( topoData ),
    localResultData: JSON.stringify( localResuls ),
    regionalResultData: JSON.stringify( regionalResults ),
    nationalResultData: JSON.stringify( nationalResults ),
    nationalResultChart: nationalResultChart,
    regionalBreakdownChart: regionalBreakdownChart,
};

const indexHTML = nunjucks.render( 'index.html', context );
const homepageWidget = nunjucks.render( 'homepage-widget.html', nationalResults );

fs.writeFileSync( outputLocation + 'index.html', indexHTML );
fs.writeFileSync( outputLocation + 'homepage-widget.html', homepageWidget );

//Javascript build
const writeStream = fs.createWriteStream(outputLocation + 'js/bundle.js')
const browserify = require('browserify');
browserify('./browser-js/main.js')
    .exclude('d3')
    .bundle()
    .pipe(writeStream);

//utitlity functions

function loadLocalJSON(filename){
    return JSON.parse( fs.readFileSync( filename, 'utf-8' ) );
}

function loadLocalCSV(filename){
    return d3.csv.parse( fs.readFileSync( filename, 'utf-8') );
}

function makeLookup(array, key){
    return array.reduce(function(prev, current, i, a){
        prev[ current[key] ] = current;
        return prev;
    }, {});
}