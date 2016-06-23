const results = require('../build/result').default;
const next = require('../build/next-front-page').default;
const path = require('path');

const results_dir = path.resolve(process.cwd(), process.argv[2]);
const override_dir = path.resolve(process.cwd(), process.argv[3]);
const output_dir = path.resolve(process.cwd(), process.argv[4]);

console.log('results', results_dir);
console.log('overrides', override_dir);
console.log('output', output_dir);

results(results_dir, override_dir, output_dir)
.then((data) => {
  return next(output_dir, data)
})
.then(() => {
  console.log('Done');
})
.catch(reason => {
  console.error(reason);
})
