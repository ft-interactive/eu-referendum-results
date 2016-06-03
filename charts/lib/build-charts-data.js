'use strict';

const assertHexColor = require('./assert-hex-color');
const assertNumeric = require('./assert-numeric');
const d3Array = require('d3-array');
const d3Scale = require('d3-scale');
const d3Shape = require('d3-shape');

module.exports = buildChartsData;

function buildChartsData(config, data) {
	config = verifyChartConfig(config);
	config.maxCharts = 3;

	data.charts = data.charts.map((chart, index) => {
		chart.index = index;
		return buildChartData(config, chart);
	});

	return {
		width: config.width,
		height: config.height,
		background: config.background,
		spacing: config.spacing,
		layout: config.layout,
		charts: data.charts,
		metricEmbed: true
	};
}

function buildChartData(config, chart) {

	// Calculate the chart dimensions/positioning
	if (config.layout === 'horizontal') {
		const availableWidth = config.width - (config.spacing * (config.maxCharts - 1));
		const chartWidth = (availableWidth / config.maxCharts);
		chart.x = chart.index * (chartWidth + config.spacing);
		chart.y = 0;
		chart.width = chartWidth;
		chart.height = config.height;
	} else {
		const availableHeight = config.height - (config.spacing * (config.maxCharts - 1));
		const chartHeight = (availableHeight / config.maxCharts);
		chart.x = 0;
		chart.y = chart.index * (chartHeight + config.spacing);
		chart.width = config.width;
		chart.height = chartHeight;
	}
	chart.margin = {
		top: 20,
		left: 50,
		bottom: 0,
		right: 10
	};
	chart.plotArea = {
		width: chart.width - chart.margin.left - chart.margin.right,
		height: chart.height - chart.margin.top - chart.margin.bottom
	};

	const valueDomain = d3Array.extent(chart.series, point => {
		return (point ? point.value : null);
	}).reverse();
	// Pad the value domain with the difference of its values
	const valueDomainDiff = valueDomain[0] - valueDomain[1];
	valueDomain[0] += valueDomainDiff;
	valueDomain[1] -= valueDomainDiff;

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
		.y(point => yScale(point.value))
		(chart.series);

	// Add data start/end circles
	chart.startY = yScale(chart.series[0].value);
	chart.endY = yScale(chart.series[chart.series.length - 1].value);

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

	// Validate/sanitize the spacing
	assertNumeric(config.spacing, 'The chart spacing must be a number');
	config.spacing = Math.abs(parseInt(config.spacing, 10));

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
