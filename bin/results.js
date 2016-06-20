// import yargs from 'yargs';
import results from '../lib/result';
import path from 'path';

const results_dir = path.resolve(process.cwd(), process.argv[2]);
const override_dir = path.resolve(process.cwd(), process.argv[3]);
const output_dir = path.resolve(process.cwd(), process.argv[4]);

results(results_dir, override_dir, output_dir).then(() => {
  console.log('Done');
}).catch(reason => {
  console.error(reason);
})
