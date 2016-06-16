import test from 'ava';
import fs from 'fs';
import bluebird from 'bluebird';

import {lastest_running_totals,
          list_running_totals,
          all_running_totals} from '../lib/result/pa/running-totals';

bluebird.promisifyAll(fs);

const results_dir = 'fixtures/pa-ftp/results';
const empty_results_dir = 'fixtures/pa-ftp/no_results';

test('latest data', async t => {
  const running_totals = await lastest_running_totals(results_dir);
  t.deepEqual(running_totals, {
    number_of_results: 382,
    total_voting_areas: 382,
    remain_voting_areas: 191,
    remain_votes: 12212799,
    remain_percentage_share: 50.02,
    leave_voting_areas: 188,
    leave_votes: 12204277,
    leave_percentage_share: 49.98,
    tied_voting_areas: 3
  });
});

test('no data available yet', async t => {
  t.falsy(await lastest_running_totals(empty_results_dir));
});

test('no files availale', async t => {
  const result = await list_running_totals(empty_results_dir);
  t.true(Array.isArray(result), 'returns an array');
  t.falsy(result.length, 'returns empty array');
});

test('list available files', async t => {

  function is_ascending_by_revision(array) {
    return array.every((f, i, a) => !i || f.revision > a[i-1].revision);
  }

  const files = await list_running_totals(results_dir);
  const first = files[0];
  const last = files[files.length - 1];

  t.true(files.every(f => f.is_running_totals), 'All files are running totals');
  t.true(is_ascending_by_revision(files), 'Sorted by revision ascending');

});

test('data from all revisions', async t => {
    const data = await all_running_totals(results_dir);
    const num_running_total_files = (await fs.readdirAsync(results_dir).filter(f => f.startsWith('EU_running_totals'))).length;

    function is_ascending_by_number_of_results(array) {
      return array.every((f, i, a) => !i || f.number_of_results > a[i-1].number_of_results);
    }

    t.is(data.length, num_running_total_files, 'As many rows as there are fixture files');
    t.true(data.length > 1, 'Has more than one row');
    t.true(is_ascending_by_number_of_results(data), 'Sorted with most recent last');
});

test.todo('check roll up values on partial-result')
