'use strict';

const buildChartData = require('./lib/build-chart-data');
const fs = require('fs');
const handleError = require('./lib/handle-error');
const nunjucks = require('nunjucks');
const path = require('path');
const exec = require('child_process').execSync;

// Handle errors
process.on('uncaughtException', handleError);

// Load the chart config and data
const chartsConfig = require('./charts.json');
const data = require('./data/sample.json'); // TODO use real data

// Create the build directory
const buildDirectory = path.join(__dirname, 'build');
console.log(`Creating directory "${buildDirectory}"`);
exec(`mkdir -p "${buildDirectory}"`);

// Configure nunjucks
nunjucks.configure(path.resolve(__dirname, 'views'));

// Generate the charts
chartsConfig.forEach(chartConfig => {

	console.log(`Generating chart "${chartConfig.name}"`);
	const chartData = buildChartData(chartConfig, data);
	const chartSvg = nunjucks.render('chart.svg', chartData);

	const chartFilePath = path.join(buildDirectory, `${chartConfig.name}.svg`);
	console.log(`Saving chart "${chartFilePath}"`);
	fs.writeFileSync(chartFilePath, chartSvg)

});
