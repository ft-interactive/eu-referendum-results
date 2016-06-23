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
  console.log('');
  console.log('Remain', data.national.remain_percentage_share);
  console.log('Leave', data.national.leave_percentage_share);
  console.log('Turnout', data.national.percentage_turnout);
  console.log('Num results', data.national.number_of_results);
  console.log('Electorate', data.national.electorate);
  console.log('Results built', new Date());
  return next(output_dir, data)
})
.then(() => {
  console.log('Next home page data built', new Date());
})
.catch(reason => {
  console.error(reason);
})
