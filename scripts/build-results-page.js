//config
const outputLocation = '../site/';
const dataLocation = '../site/dummyresult/';

//dependencies
const fs = require('fs');
const nunjucks = require('nunjucks');

const layoutVoteSwing = require('./layout-vote-swing.js');
const layoutNationalBars = require('./layout-national-bars.js');
const writer = require('./news-writer.js');
const topoData = require('./geodata/referendum-result-areas.json');

const regionalResults = loadLocalJSON( dataLocation + 'regional-named.json' );
const nationalResults = loadLocalJSON( dataLocation + 'national.json' );

const words = writer(nationalResults, regionalResults);

//console.log(words);

nunjucks.configure('templates', { autoescape: false });


const nationalResultChart = nunjucks.render('national-result-chart.html', layoutNationalBars( nationalResults));
const regionalBreakdownChart = nunjucks.render('vote-swing.svg', layoutVoteSwing( regionalResults ));


const context = {
    datetime: String(new Date()),
    headline: words.headline,
    standfirstList: words.standfirstList,
    topoData: JSON.stringify(topoData),
    nationalResultChart: nationalResultChart,
    regionalBreakdownChart: regionalBreakdownChart,
};

console.log( context.headline )
console.log( context.standfirstList )

const indexHTML = nunjucks.render( 'index.html', context );

fs.writeFileSync( outputLocation + 'test.html', indexHTML );

function loadLocalJSON(filename){
    return JSON.parse( fs.readFileSync( filename, 'utf-8' ) );
}