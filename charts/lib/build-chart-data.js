'use strict';

const assertHexColor = require('./assert-hex-color');
const assertNumeric = require('./assert-numeric');

module.exports = buildChartData;

function buildChartData(config, data) {
	config = verifyChartConfig(config);

	return {
		width: config.width,
		height: config.height,
		background: config.background,
		metricEmbed: true
	};
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
