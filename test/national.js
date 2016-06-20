import test from 'ava';
import Facts from './fixtures/facts';
import fixture from './fixtures/rollup/national-rollup';
import {national} from '../lib/result/national';
import {all_voting_areas} from '../lib/result/voting-area';

test('collate without empty overrides', async t => {

  const results_dir = 'fixtures/pa-ftp/partial-result';

  const voting_areas = await all_voting_areas(results_dir);
  const data = await national(voting_areas, results_dir);

  // TODO: count_error: 0,

  t.is(data.state, fixture.state);
  t.is(data.outcome, fixture.outcome);
  t.is(data.remain_votes, fixture.remain_votes);
  t.is(data.leave_votes, fixture.leave_votes);
  t.is(data.remain_percentage_share, fixture.remain_percentage_share);
  t.is(data.leave_percentage_share, fixture.leave_percentage_share);
  t.is(data.majority, fixture.majority);
  t.is(data.percentage_majority, fixture.percentage_majority);
  t.is(data.turnout, fixture.turnout);
  t.is(data.electorate, fixture.electorate);
  t.is(data.percentage_turnout, fixture.percentage_turnout);

  t.is(data.awaiting_numbers, fixture.awaiting_numbers);
  t.is(data.awaiting_reports, fixture.awaiting_reports);
  t.is(
    data.awaiting_numbers + data.awaiting_reports,
    data.incomplete_counts.length
  );
  t.is(
    (data.remain_voting_areas +
    data.leave_voting_areas +
    data.tied_voting_areas),
    data.complete_counts.length
  );
  t.is(
    (data.complete_counts.length +
    data.incomplete_counts.length),
    Facts.TOTAL_VOTING_AREAS
  );
  t.is(
    (data.remain_voting_areas +
    data.leave_voting_areas +
    data.tied_voting_areas),
    data.number_of_results
  );
  t.is(data.remain_voting_areas, fixture.remain_voting_areas);
  t.is(data.leave_voting_areas, fixture.leave_voting_areas);
  t.is(data.tied_voting_areas, fixture.tied_voting_areas);
  t.is(data.number_of_results, fixture.number_of_results);
  t.is(data.total_voting_areas, Facts.TOTAL_VOTING_AREAS);
  t.false(data.manual_override);


})
