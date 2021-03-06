'use strict';

//config
const config = require('./config.json');

//dependencies
const fs = require('fs');
const nunjucks = require('nunjucks');
const d3 = require('d3');
const request = require('request');

const layoutVoteSwing = require('./layout-vote-swing.js');
const layoutNationalBars = require('./layout-national-bars.js');
const layoutFullTable = require('./layout-full-table');
const writer = require('./news-writer.js');
const topoData = require('./geodata/referendum-result-areas.json');


//HTML build

console.log(new Date() + "building")
request(config.bertha, parseBertha);

function parseBertha(error, response, berthaBody) {

    let opts;

    if (!error && response.statusCode == 200) {
        opts = JSON.parse(berthaBody).options;
        fs.writeFileSync(config.berthaBackup, JSON.stringify(opts));

        request(config.storiesFragment, function(error, response, storiesBody){
            if (!error && response.statusCode == 200) {
                opts.stories = storiesBody;
                fs.writeFileSync( config.storiesFragmentBackup, storiesBody );
            } else {
                opts.stories = fs.readFileSync(config.storiesFragmentBackup);
            }
            build(opts);
        });
    } else {
        opts = JSON.parse(fs.readFileSync(config.berthaBackup));
        opts.stories = fs.readFileSync(config.storiesFragmentBackup);
        build(opts);
    }
}

function build( berthaData ){
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

    const localResults = loadLocalJSON( config.localResult )
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
    nunjucks.configure('templates', { autoescape: false });


    const words = writer(nationalResults, regionalResults, localResults);
    const fullTable = nunjucks.render('full-table.html', layoutFullTable( localResults ));
    const nationalResultChart = nunjucks.render('national-result-chart.html', layoutNationalBars( nationalResults));
    const regionalBreakdownChart = nunjucks.render('vote-swing.svg', layoutVoteSwing( regionalResults ));


    const context = {
        bertha: berthaData,
        cacheBuster: config.version,
        datetime: String(new Date()),
        headline: words.headline,
        marginStatement: words.marginStatement,
        leaveRemainExtremes: words.leaveRemainExtremes,
    //    standfirstList: words.standfirstList,
        topoData: JSON.stringify( topoData ),
        localResultData: JSON.stringify( localResults ),
        regionalResultData: JSON.stringify( regionalResults ),
        nationalResultData: JSON.stringify( nationalResults ),
        nationalResultChart: nationalResultChart,
        regionalBreakdownChart: regionalBreakdownChart,
        fullTable: fullTable,
        social: {
            title: berthaData.title || 'Referendum local results map, live tracker',
            description: 'Follow live results with the FT',
            url: 'https://ig.ft.com/sites/elections/2016/uk/eu-referendum',
            image: 'https://www.ft.com/__origami/service/image/v2/images/raw/ftcms:60d8274e-33e0-11e6-bda0-04585c31b153?source=ig'
        }
    };

    let indexHTML = nunjucks.render( 'index_holding.html', { datetime: new Date() } );
    let homepageWidget = nunjucks.render( 'homepage-widget_holding.html', {datetime: new Date()} );

    if(config.live){
        indexHTML = nunjucks.render( 'index.html', context );
        homepageWidget = nunjucks.render( 'homepage-widget.html', {data:nationalResults, orderedData:layoutNationalBars( nationalResults )} );
    }

    fs.writeFileSync( config.outputLocation + 'index.html', indexHTML );
    fs.writeFileSync( config.outputLocation + 'homepage-widget.html', homepageWidget );

    console.log('  html done');

    //Javascript build
    const writeStream = fs.createWriteStream(config.outputLocation + 'js/bundle.js')
    const browserify = require('browserify');
    browserify('./browser-js/main.js')
        .exclude('d3')
        .bundle()
        .pipe(writeStream);

    console.log('  js done');
    //CSS copy
    fs.createReadStream('./style/article.css').pipe(fs.createWriteStream(config.outputLocation + 'style/article.css'));
    fs.createReadStream('./style/result-graphics.css').pipe(fs.createWriteStream(config.outputLocation + 'style/result-graphics.css'));
    console.log('  css done. FIN. ('+new Date()+')');
}
//utitlity functions

function loadLocalJSON(filename){
    return JSON.parse( fs.readFileSync( filename, 'utf-8' ) );
}

function makeLookup(array, key){
    return array.reduce(function(prev, current, i, a){
        prev[ current[key] ] = current;
        return prev;
    }, {});
}
