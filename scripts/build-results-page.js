//config
const outputLocation = '../site/';
const dataLocation = '../site/dummyresult/';

//dependencies
const fs = require('fs');
const layoutVoteSwing = require('./layout-vote-swing.js');
const layoutNationalBars = require('./layout-national-bars.js');
const nunjucks = require('nunjucks');
const topoData = require('./geodata/referendum-result-areas.json');
const regionalResults = require( dataLocation + 'regional-named.json' );
const nationalResults = require( dataLocation + 'national.json' );




nunjucks.configure('templates', { autoescape: false });

const nationalResultChart = nunjucks.render('national-result-chart.html', layoutNationalBars( nationalResults));
const regionalBreakdownChart = nunjucks.render('vote-swing.svg', layoutVoteSwing( regionalResults ));

const headline = function(result){
   return  'headline';
}(nationalResults);

const context = {
    headline: headline,
    topoData: JSON.stringify(topoData),
    nationalResultChart: nationalResultChart,
    regionalBreakdownChart: regionalBreakdownChart,
};

const indexHTML = nunjucks.render('index.html', context);

fs.writeFileSync( outputLocation + 'test.html', indexHTML );