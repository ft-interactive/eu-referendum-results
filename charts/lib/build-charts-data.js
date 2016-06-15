'use strict';

const assertHexColor = require('./assert-hex-color');
const assertNumeric = require('./assert-numeric');
const d3Array = require('d3-array');
const d3Format = require('d3-format');
const d3Scale = require('d3-scale');
const d3Shape = require('d3-shape');

module.exports = buildChartsData;

function buildChartsData(config, data) {
	config = verifyChartConfig(config);
	config.maxCharts = 3;
	let chartData = data.charts;

	chartData = chartData.filter((chart) => {
		if (config.show.indexOf(chart.symbol) >= 0) {
			return chart;
		}
	});

	// Check what's in data.charts and via a setting, only send the ones through
	// to the map function that we want to build for the charts
	chartData = chartData.map((chart, index) => {
		chart.index = index;

		return buildChartData(config, chart);
	});



	return {
		width: config.width,
		height: config.height,
		background: config.background,
		lineStroke: config.lineStroke,
		text: config.text,
		axisStroke: config.axisStroke,
		textSize: config.textSize,
		spacing: config.spacing,
		layout: config.layout,
		charts: chartData,
		metricEmbed: true
	};
}

function buildChartData(config, chart) {

	// Calculate the chart dimensions/positioning
	if (config.layout === 'horizontal') {
		const availableWidth = config.width - (config.spacing * (config.maxCharts - 1));
		const chartWidth = (availableWidth / config.maxCharts);
		chart.x = Math.floor(chart.index * (chartWidth + config.spacing));
		chart.y = 0;
		chart.width = chartWidth;
		chart.height = config.height;
	} else {
		const availableHeight = config.height - (config.spacing * (config.maxCharts - 1));
		const chartHeight = (availableHeight / config.maxCharts);
		chart.x = 0;
		chart.y = Math.floor(chart.index * (chartHeight + config.spacing));
		chart.width = config.width;
		chart.height = chartHeight;
	}
	chart.margin = {
		top: 20,
		left: 50,
		bottom: 0,
		right: 50
	};
	chart.plotArea = {
		width: Math.floor(chart.width - chart.margin.left - chart.margin.right),
		height: Math.floor(chart.height - chart.margin.top - chart.margin.bottom)
	};

	const firstValue = chart.series[0].value;
	const lastValue = chart.series[chart.series.length - 1].value;

	const valueExtent = d3Array.extent(chart.series, point => {
		return (point ? point.value : null);
	}).reverse();
	// Pad the value domain with the difference of its values
	const valueExtentDiff = valueExtent[0] - valueExtent[1];
	const valueDomain = [
		valueExtent[0] + valueExtentDiff,
		valueExtent[1] - valueExtentDiff
	];

	const dateDomain = [
		new Date(chart.series[0].date),
		new Date(chart.series[chart.series.length - 1].date)
	];

	const yScale = d3Scale.linear()
		.domain(valueDomain)
		.range([0, chart.plotArea.height]);

	const xScale = d3Scale.time()
		.domain(dateDomain)
		.range([0, chart.plotArea.width]);

	// Add chart data
	const buildLine = d3Shape.line();
	if (chart.type === 'index') {
		buildLine.defined(point => typeof point.value === 'number');
	}
	chart.data = buildLine
		.x(point => xScale(new Date(point.date)))
		.y(point => Math.floor(yScale(point.value)))
		(chart.series);

	// Add data start/end circles
	chart.startY = Math.floor(yScale(chart.series[0].value));
	chart.endY = Math.floor(yScale(chart.series[chart.series.length - 1].value));

	// Add the end value labels
	chart.endValue = {};
	if (chart.type === 'index') {
		chart.endValue.label = d3Format.format(',.1f')(lastValue)
	} else {
		chart.endValue.label = (chart.symbolLabel || '') + d3Format.format('.3f')(lastValue)
	}

	const percentageChange = ((lastValue - firstValue) / lastValue) * 100;
	chart.endValue.diff = d3Format.format(',.1f')(percentageChange) + '%';

	if (percentageChange < 0) {
		chart.diffColor = '#ca4050'; // Red
	} else {
		chart.diffColor = '#09a25c'; // Green: 03ac7a
	}

	return chart;
}

function verifyChartConfig(config) {

	// Validate/sanitize the dimensions
	assertNumeric(config.width, 'The chart width must be a number');
	assertNumeric(config.height, 'The chart height must be a number');
	config.width = Math.abs(parseInt(config.width, 10));
	config.height = Math.abs(parseInt(config.height, 10));

	// Validate/sanitize the background color
	if (config.background) {
		assertHexColor(config.background, 'The chart background color must be a hex color');
		if (config.background.indexOf('#') !== 0) {
			config.background = `#${config.background}`;
		}
	}

	if (config.lineStroke) {
		assertHexColor(config.lineStroke, 'The chart line stroke color must be a hex color');
		if (config.lineStroke.indexOf('#') !== 0) {
			config.lineStroke = `#${config.lineStroke}`;
		}
	}

	if (config.axisStroke) {
		assertHexColor(config.axisStroke, 'The chart axis stroke color must be a hex color');
		if (config.axisStroke.indexOf('#') !== 0) {
			config.axisStroke = `#${config.axisStroke}`;
		}
	}

	if (config.text) {
		assertHexColor(config.text, 'The chart text color must be a hex color');
		if (config.text.indexOf('#') !== 0) {
			config.text = `#${config.text}`;
		}
	}

	// Validate/sanitize the spacing
	assertNumeric(config.spacing, 'The chart spacing must be a number');
	config.spacing = Math.abs(parseInt(config.spacing, 10));

	// Font Size
	assertNumeric(config.textSize, 'The chart text size must be a number');
	config.textSize = Math.abs(parseInt(config.textSize, 10));

	// Validate/sanitize the layout
	const allowedLayouts = [
		'horizontal',
		'vertical'
	];
	if (allowedLayouts.indexOf(config.layout) === -1) {
		throw new Error('The chart layout must be one of: ' + allowedLayouts.join(', '));
	}

	return config;
}
