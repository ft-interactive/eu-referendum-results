
'use strict';

let data = [];

const chart_default = {
	name: null,
	width: null,
	height: null,
	background: null,
	lineStroke: null,
	text: null,
	textSize: null,
	axisStroke: null,
	spacing: null,
	layout: 'horizontal',
	show: []
};

const color_variants = {
	homepage: {
		lineStroke: '#ff2b21',
		text: '#999999',
		textSize: 12,
		axisStroke: '#c2c2c2',
	},
	fullpage: {
		lineStroke: '#af516c',
		text: '#333333',
		textSize: 12,
		axisStroke: '#a7a59b',
	}
};

const size_variants = {
	small: {
		width: 400,
		height: 65,
		spacing: 2
	},
	medium: {
		width: 500,
		height: 85,
		spacing: 5
	},
	large: {
		width: 600,
		height: 100,
		spacing: 10
	},
	xlarge: {
		width: 680,
		height: 115,
		spacing: 10
	}
};

const symbol_variants = {
	day: [
		"GBPEUR",
		"USDEUR",
		"FTSE:FSI"
	],
	night: [
		"GBPEUR",
		"USDEUR",
		"GBPUSD"
	]
};

// create variants output

// symbols
Object.keys(symbol_variants).forEach(symbol => {
	let chart = Object.assign({}, chart_default); // make copy of the default
	chart.show = symbol_variants[symbol]; // set 'show' data
	// sizes
	Object.keys(size_variants).forEach(size => {
		chart = Object.assign({}, chart, size_variants[size]); // make copy with size data
		// colors
		Object.keys(color_variants).forEach(scheme => {
			chart = Object.assign({}, chart, color_variants[scheme]); // make copy with color data
			// save out
			chart.name = `${symbol}-${scheme}-${size}`;
			data.push(chart);
		});
	});
});

module.exports = data;
