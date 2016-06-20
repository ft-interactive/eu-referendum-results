import test from 'ava';

import Facts from './fixtures/facts';
import State from '../lib/result/state';
import RegionRollup from './fixtures/rollup/region-rollup';
import Outcome from '../lib/result/outcome';
import {all_regions} from '../lib/result/region';
import {all_voting_areas} from '../lib/result/voting-area';

const results_dir = 'fixtures/pa-ftp/results';
const empty_results_dir = 'fixtures/pa-ftp/no_results';

test('correct amount of regions and voting areas', async t => {
  const voting_areas = await all_voting_areas(results_dir);
  const regions = await all_regions(voting_areas);

  t.plan(Facts.TOTAL_REGIONS + 1);
  t.is(regions.length,  Facts.TOTAL_REGIONS, 'Correct number of regions')

  regions.forEach(region => {
    t.is(region.total_voting_areas,
          Facts.REGION_TOTAL_AREAS[region.id],
          region.name + ' correct total is ' + Facts.REGION_TOTAL_AREAS[region.id]);
  });

});

test('basic type checking for calculations', async t => {
  const voting_areas = await all_voting_areas(results_dir);
  const regions = await all_regions(voting_areas);

  const finite_fields = [
    'remain_votes', 'remain_percentage_share',
    'leave_votes', 'leave_percentage_share',
    'majority', 'percentage_majority',
    'electorate', 'turnout', 'percentage_turnout',
    'remain_voting_areas', 'leave_voting_areas', 'tied_voting_areas',
    'number_of_results', 'awaiting_numbers', 'awaiting_reports',
    'recounts_pending', 'count_error'
  ];

  t.plan(finite_fields.length * Facts.TOTAL_REGIONS);

  regions.forEach(region => {
    for (let field of finite_fields) {
      t.true(Number.isFinite(region[field]), region.name + ' ' + field + ' is finite');
    }
  });
});

test('no results data', async t => {

  const voting_areas = await all_voting_areas(empty_results_dir);
  const regions = await all_regions(voting_areas);

  const num_assertions_per_region = 13;
  t.plan((Facts.TOTAL_REGIONS * num_assertions_per_region) + 1);

  t.is(regions.length, Facts.TOTAL_REGIONS, 'Correct number of regions');

  regions.forEach(region => {
    const total_areas = Facts.REGION_TOTAL_AREAS[region.id];
    t.is(region.total_voting_areas, total_areas, region.name + ' correct total is ' + total_areas);
    t.is(region.awaiting_reports, total_areas, 'Awaiting all areas');
    t.is(region.recounts_pending, 0, 'No recounts');
    t.is(region.state, State.NONE);
    t.is(region.outcome, Outcome.NONE);
    t.is(region.turnout, 0);
    t.is(region.percentage_turnout, 0);
    t.is(region.leave_votes, 0);
    t.is(region.remain_votes, 0);
    t.is(region.leave_percentage_share, 0);
    t.is(region.remain_percentage_share, 0);
    t.is(region.majority, 0);
    t.is(region.percentage_majority, 0);
  });
});

test('check rollup on partial result', async t => {

  const voting_areas = await all_voting_areas('fixtures/pa-ftp/partial-result');

  const regions = await all_regions(voting_areas);

  const num_assertions_per_region = 18;
  t.plan(Facts.TOTAL_REGIONS * num_assertions_per_region);

  regions.forEach(region => {

    const rollup = RegionRollup[region.id];

    if (!rollup) throw new Error(`Region ${region.id} not found`);

    t.is(region.remain_votes, rollup.remain_votes, region.name + '.remain_votes');
    t.is(region.leave_votes, rollup.leave_votes, region.name + '.leave_votes');
    t.is(region.remain_percentage_share, rollup.remain_percentage_share, region.name + '.remain_percentage_share');
    t.is(region.leave_percentage_share, rollup.leave_percentage_share, region.name + '.leave_percentage_share');

    const total_percent_vote = region.remain_percentage_share + region.leave_percentage_share;
    const expected_sum = rollup.remain_votes === 0 && rollup.leave_votes === 0 ? 0 : 100;
    t.is(total_percent_vote, expected_sum, 'percentage votes sum to 100 or zero');

    t.is(region.majority, rollup.majority, region.name + '.majority');
    t.is(region.percentage_majority, rollup.percentage_majority, region.name + '.percentage_majority');
    t.is(region.electorate, rollup.electorate, region.name + '.electorate');
    t.is(region.turnout, rollup.turnout, region.name + '.turnout');
    t.is(region.percentage_turnout, rollup.percentage_turnout, region.name + '.percentage_turnout');
    t.is(region.awaiting_numbers, rollup.awaiting_numbers, region.name + '.awaiting_numbers');
    t.is(region.tied_voting_areas, rollup.tied_voting_areas, region.id + '.tied_voting_areas');

    const total_areas = Facts.REGION_TOTAL_AREAS[region.id];
    const total_results = total_areas - rollup.no_result;

    t.is(region.number_of_results, total_results);
    t.is(region.awaiting_reports, total_areas - total_results - region.awaiting_numbers);

    t.is(region.outcome, rollup.outcome, region.name + '.outcome');
    t.is(region.state, rollup.state, region.name + '.state');
    t.is(region.complete_counts.length, total_results);
    t.is(region.incomplete_counts.length, rollup.no_result);

  });

});
