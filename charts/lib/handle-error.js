'use strict';

module.exports = handleError;

function handleError(error) {
	console.error('Chart generation failed:', error.message);
	process.exit(1);
}
