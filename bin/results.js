const results = require('../build/result').default;
const next = require('../build/next-front-page');
const path = require('path');

const results_dir = path.resolve(process.cwd(), process.argv[2]);
const override_dir = path.resolve(process.cwd(), process.argv[3]);
const output_dir = path.resolve(process.cwd(), process.argv[4]);

results(results_dir, override_dir, output_dir)
.then(() => {
  return Promise.resolve(true);
  // return next(output_dir, data)
})
.then(() => {
  console.log('Done');
})
.catch(reason => {
  console.error(reason);
})
