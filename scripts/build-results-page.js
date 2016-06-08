//config
const outputLocation = '../site/';
const dataLocation = '../site/dummyresult/';

//dependencies
const fs = require('fs');
const nunjucks = require('nunjucks');
const d3 = require('d3');

//HTML build

const layoutVoteSwing = require('./layout-vote-swing.js');
const layoutNationalBars = require('./layout-national-bars.js');
const writer = require('./news-writer.js');
const topoData = require('./geodata/referendum-result-areas.json');

const regionalResults = loadLocalJSON( dataLocation + 'regional-named.json' );
const nationalResults = loadLocalJSON( dataLocation + 'national.json' );
const localResuls = loadLocalJSON( dataLocation + 'local.json');
const lookupByID = makeLookup( loadLocalCSV( './data/names.csv' ), 'ons_id');

const words = writer(nationalResults, regionalResults, localResuls, lookupByID);

nunjucks.configure('templates', { autoescape: false });


const nationalResultChart = nunjucks.render('national-result-chart.html', layoutNationalBars( nationalResults));
const regionalBreakdownChart = nunjucks.render('vote-swing.svg', layoutVoteSwing( regionalResults ));

const context = {
    datetime: String(new Date()),
    headline: words.headline,
    standfirstList: words.standfirstList,
    topoData: JSON.stringify(topoData),
    localResultData: JSON.stringify(localResuls),
    nationalResultChart: nationalResultChart,
    regionalBreakdownChart: regionalBreakdownChart,
};

const indexHTML = nunjucks.render( 'index.html', context );

fs.writeFileSync( outputLocation + 'index.html', indexHTML );

//Javascript build
const writeStream = fs.createWriteStream(outputLocation + 'js/bundle.js')
const browserify = require('browserify');
browserify('./browser-js/main.js')
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