import test from 'ava';
import fs from 'fs';
import bluebird from 'bluebird';
import constants from 'constants';

import {all_voting_areas, all_voting_areas_with_census} from '../lib/result/voting-area';
import Outcome from '../lib/result/outcome';
import State from '../lib/result/state';
import Facts from './fixtures/facts';

bluebird.promisifyAll(fs);

const results_dir = 'fixtures/pa-ftp/results';
const empty_results_dir = 'fixtures/pa-ftp/no_results';
const fixture = (filename) => fs.readFileAsync(`${results_dir}/${filename}.xml`, 'utf-8');

test('all voting area data', async t => {
  const data = await all_voting_areas(results_dir);
  t.is(data.length, Facts.TOTAL_VOTING_AREAS);

  const areas_with_an_outcome = data.filter(d => d.outcome !== Outcome.NONE);
  t.not(areas_with_an_outcome.length, 0);

  const aylesbury_vale = data.find(d => d.ons_id === 'E07000004');
  t.is(aylesbury_vale.name, 'Aylesbury Vale');
  t.is(aylesbury_vale.outcome, Outcome.LEAVE);
  t.is(aylesbury_vale.state, State.RESULT);

});

test.todo('ensure 12 unique regions');

test.skip('census', async t => {
  const data = await all_voting_areas_with_census(results_dir);
  console.dir(data);
});

test('before voting area data available', async t => {
  const data = await all_voting_areas(empty_results_dir);
  t.true(Array.isArray(data), 'Returns Array');

  t.is(data.length, Facts.TOTAL_VOTING_AREAS);

  const areas_with_an_outcome = data.filter(d => d.outcome !== Outcome.NONE);
  t.is(areas_with_an_outcome.length, 0);

  const areas_with_reported_electorate = data.filter(d => d.electorate > 0);
  t.is(areas_with_reported_electorate.length, 0);
});

test('northern ireland', async t => {
  const data = (await all_voting_areas(results_dir)).filter(d => d.region_name === 'Northern Ireland');
  t.is(data.length, 1, 'Only one voting area');

  const ni = data[0];
  t.is(ni.ons_id, Facts.NORTHERN_IRELAND_ID, 'Has correct local ONS ID');
  t.is(ni.pa_id, '228', 'Has correct PA ID');
  t.is(ni.turnout, 639221);
});


test('gibraltar', async t => {
  const data = (await all_voting_areas(results_dir)).filter(d => d.name === 'Gibraltar');
  t.is(data.length, 1, 'Exactly one voting area');

  const gib = data[0];

  t.is(gib.ons_id, Facts.GIBRALTAR_ID, 'Gibraltar with fake ONS ID');
  t.is(gib.region_id, Facts.GIBRALTAR_REGION_ID, 'Gibralter in the SW England region');
  t.is(gib.pa_id, '132');
  t.is(gib.electorate, 22265);
  t.is(gib.outcome, Outcome.REMAIN);
  t.is(gib.remain_votes, 6736);
  t.is(gib.leave_votes, 5499);
  t.is(gib.state, State.RESULT);
});

test('Aylesbury Vale has Rush, Result and Recount data', async t => {
  const data = (await all_voting_areas(results_dir)).find(d => d.ons_id === 'E07000004');
  t.is(data.name, 'Aylesbury Vale');
  t.is(data.outcome, Outcome.LEAVE);
  t.is(data.state, State.RESULT);
  t.is(data.leave_votes, 41221);
  t.is(data.leave_percentage_share, 50.68);
  t.is(data.remain_votes, 40122);
  t.is(data.remain_percentage_share, 49.32);
  t.is(data.electorate, 135888);
  t.is(data.turnout, 81343);
  t.is(data.percentage_turnout, 59.86);
  t.is(data.majority, 1099);
  t.is(data.percentage_majority, 1.35);
  t.is(data.num_recounts, 5, 'Recount number given in last update');
  t.is(data.recount_revisions, 3, 'Three Recount files');
});

test('Islington only has Rush data, no result', async t => {
  const data = (await all_voting_areas(results_dir)).find(d => d.ons_id === 'E09000019');
  t.is(data.name, 'Islington');
  t.is(data.outcome, Outcome.LEAVE);
  t.is(data.state, State.OUTCOME);
  t.falsy(data.leave_votes);
  t.falsy(data.leave_percentage_share);
  t.falsy(data.remain_votes);
  t.falsy(data.remain_percentage_share);
});

test.todo('State.RESULT_OLD');
test.todo('State.NONE');
test.todo('State.TURNOUT');
test.todo('Recount pending');
test.todo('Rush after result where outcome changes - no results yet');
test.todo('FT name overrides PA name')
