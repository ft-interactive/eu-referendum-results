import test from 'ava';

import Facts from './fixtures/facts';
import State from '../lib/result/state';
import Outcome from '../lib/result/outcome';

import {rollup_voting_areas,
          calculate_outcome, calculate_state, majority,
          percentage_share, percentage_turnout} from '../lib/result/rollup';

import {create_voting_area} from '../lib/result/voting-area';

function create_test_voting_area(name, outcome, state, remain, leave, electorate) {
  const va = create_voting_area({ons_id: name, name: name, pa_id: name});
  va.remain_votes = remain;
  va.leave_votes = leave;
  va.turnout = remain + leave;
  va.electorate = electorate;
  va.state = state;
  va.outcome = outcome;
  return va;
}


// projected_outcome: Outcome.NONE
// state
// outcomew
test.todo('ensure all states are tested included OUTCOME, RESULT and RESULT OLD')
test.todo('test all kinds of outcome - ');
test.todo('rollup projected_outcome');
test.todo('count error')

test('incomplete remain rollup', async t => {
  const r = rollup_voting_areas([

    create_test_voting_area('A', Outcome.REMAIN, State.RESULT,
                250, 100, 450),

    create_test_voting_area('B', Outcome.LEAVE, State.RESULT,
                20, 80, 120),

    create_test_voting_area('C', Outcome.LEAVE, State.OUTCOME,
                null, null, 100),

    create_test_voting_area('D', Outcome.NONE, State.NONE,
                null, null, null)
  ]);

  t.is(r.remain_votes, 270);
  t.is(r.remain_percentage_share, 60);
  t.is(r.leave_votes, 180);
  t.is(r.leave_percentage_share, 40);
  t.is(r.remain_percentage_share + r.leave_percentage_share, 100);
  t.is(r.majority, 90);
  t.is(r.percentage_majority, 20);
  t.is(r.turnout, 450);
  t.is(r.electorate, 570);
  t.is(r.percentage_turnout, 450 / 570 * 100);
  t.is(r.state, State.RUNNING_TOTAL);
  t.is(r.outcome, Outcome.REMAIN);
  t.is(r.total_voting_areas, 4);
  t.is(r.number_of_results, 2);
  t.is(r.tied_voting_areas, 0);
  t.is(r.leave_voting_areas, 1);
  t.is(r.remain_voting_areas, 1);
  t.is(r.incomplete_counts.length, 2);
  t.is(r.complete_counts.length, 2);
  t.is(r.awaiting_reports, 1);
  t.is(r.awaiting_numbers, 1);

});



test('complete remain rollup', async t => {
  const r = rollup_voting_areas([

    create_test_voting_area('A', Outcome.REMAIN, State.RESULT,
                250, 100, 450),

    create_test_voting_area('B', Outcome.LEAVE, State.RESULT,
                20, 80, 120)
  ]);

  t.is(r.remain_votes, 270);
  t.is(r.remain_percentage_share, 60);
  t.is(r.leave_votes, 180);
  t.is(r.leave_percentage_share, 40);
  t.is(r.remain_percentage_share + r.leave_percentage_share, 100);
  t.is(r.majority, 90);
  t.is(r.percentage_majority, 20);
  t.is(r.turnout, 450);
  t.is(r.electorate, 570);
  t.is(r.percentage_turnout, 450 / 570 * 100);
  t.is(r.state, State.RESULT);
  t.is(r.outcome, Outcome.REMAIN);
  t.is(r.total_voting_areas, 2);
  t.is(r.number_of_results, 2);
  t.is(r.tied_voting_areas, 0);
  t.is(r.leave_voting_areas, 1);
  t.is(r.remain_voting_areas, 1);
  t.is(r.incomplete_counts.length, 0);
  t.is(r.complete_counts.length, 2);
  t.is(r.awaiting_reports, 0);
  t.is(r.awaiting_numbers, 0);

});

test('complete leave rollup', async t => {
  const r = rollup_voting_areas([

    create_test_voting_area('A', Outcome.REMAIN, State.RESULT,
                100, 250, 450),

    create_test_voting_area('B', Outcome.LEAVE, State.RESULT,
                80, 20, 120)
  ]);

  t.is(r.remain_votes, 180);
  t.is(r.remain_percentage_share, 40);
  t.is(r.leave_votes, 270);
  t.is(r.leave_percentage_share, 60);
  t.is(r.remain_percentage_share + r.leave_percentage_share, 100);
  t.is(r.majority, 90);
  t.is(r.percentage_majority, 20);
  t.is(r.turnout, 450);
  t.is(r.electorate, 570);
  t.is(r.percentage_turnout, 450 / 570 * 100);
  t.is(r.state, State.RESULT);
  t.is(r.outcome, Outcome.LEAVE);
  t.is(r.total_voting_areas, 2);
  t.is(r.number_of_results, 2);
  t.is(r.tied_voting_areas, 0);
  t.is(r.leave_voting_areas, 1);
  t.is(r.remain_voting_areas, 1);
  t.is(r.incomplete_counts.length, 0);
  t.is(r.complete_counts.length, 2);
  t.is(r.awaiting_reports, 0);
  t.is(r.awaiting_numbers, 0);

});

test('complete tied rollup', async t => {
  const turnout = 150;
  const remain_votes = turnout / 2;
  const leave_votes = turnout / 2;
  const electorate = 300;

  const r = rollup_voting_areas([
    create_test_voting_area('A', Outcome.TIED, State.RESULT, remain_votes / 3, leave_votes / 3, electorate / 3),
    create_test_voting_area('B', Outcome.TIED, State.RESULT, remain_votes / 3, leave_votes / 3, electorate / 3),
    create_test_voting_area('C', Outcome.TIED, State.RESULT, remain_votes / 3, leave_votes / 3, electorate / 3)
  ]);

  t.is(r.remain_votes, remain_votes);
  t.is(r.remain_percentage_share, 50);
  t.is(r.leave_votes, leave_votes);
  t.is(r.leave_percentage_share, 50);
  t.is(r.majority, 0);
  t.is(r.percentage_majority, 0);
  t.is(r.turnout, turnout);
  t.is(r.electorate, electorate);
  t.is(r.percentage_turnout, turnout / electorate * 100);
  t.is(r.state, State.RESULT);
  t.is(r.outcome, Outcome.TIED);
  t.is(r.total_voting_areas, 3);
  t.is(r.number_of_results, 3);
  t.is(r.tied_voting_areas, 3);
  t.is(r.leave_voting_areas, 0);
  t.is(r.remain_voting_areas, 0);
  t.is(r.incomplete_counts.length, 0);
  t.is(r.complete_counts.length, 3);
});


test('rollup areas with no data', async t => {
  const r = rollup_voting_areas([
    create_test_voting_area('A', Outcome.NONE, State.NONE, null, null, 1000),
    create_test_voting_area('B', Outcome.NONE, State.NONE, null, null, null),
    create_test_voting_area('C', Outcome.NONE, State.NONE, 0, null, 1000),
    create_test_voting_area('D', Outcome.NONE, State.NONE, 0, 0, 1000),
    create_test_voting_area('E', Outcome.LEAVE, State.NONE, 0, 0, 1000),
  ]);

  t.is(r.remain_votes, 0);
  t.is(r.remain_percentage_share, 0);
  t.is(r.leave_votes, 0);
  t.is(r.leave_percentage_share, 0);
  t.is(r.remain_percentage_share + r.leave_percentage_share, 0);
  t.is(r.majority, 0);
  t.is(r.percentage_majority, 0);
  t.is(r.turnout, 0);
  t.is(r.electorate, 0);
  t.is(r.percentage_turnout, 0);
  t.is(r.state, State.NONE);
  t.is(r.outcome, Outcome.NONE);
  t.is(r.total_voting_areas, 5);
  t.is(r.number_of_results, 0);
  t.is(r.tied_voting_areas, 0);
  t.is(r.leave_voting_areas, 0);
  t.is(r.remain_voting_areas, 0);
  t.is(r.incomplete_counts.length, 5);
  t.is(r.complete_counts.length, 0);
});

test('rollup only one area', async t => {
  const r = rollup_voting_areas([
    create_test_voting_area('A', Outcome.LEAVE, State.RESULT, 100, 400, 1000)
  ]);

  t.is(r.remain_votes, 100);
  t.is(r.remain_percentage_share, 20);
  t.is(r.leave_votes, 400);
  t.is(r.leave_percentage_share, 80);
  t.is(r.remain_percentage_share + r.leave_percentage_share, 100);
  t.is(r.majority, 300);
  t.is(r.percentage_majority, 60);
  t.is(r.turnout, 500);
  t.is(r.electorate, 1000);
  t.is(r.percentage_turnout, 50);
  t.is(r.state, State.RESULT);
  t.is(r.outcome, Outcome.LEAVE);
  t.is(r.total_voting_areas, 1);
  t.is(r.number_of_results, 1);
  t.is(r.tied_voting_areas, 0);
  t.is(r.leave_voting_areas, 1);
  t.is(r.remain_voting_areas, 0);
  t.is(r.incomplete_counts.length, 0);
  t.is(r.complete_counts.length, 1);
});

test('rollup no areas', async t => {
  const r = rollup_voting_areas([]);

  t.is(r.remain_votes, 0);
  t.is(r.remain_percentage_share, 0);
  t.is(r.leave_votes, 0);
  t.is(r.leave_percentage_share, 0);
  t.is(r.remain_percentage_share + r.leave_percentage_share, 0);
  t.is(r.majority, 0);
  t.is(r.percentage_majority, 0);
  t.is(r.turnout, 0);
  t.is(r.electorate, 0);
  t.is(r.percentage_turnout, 0);
  t.is(r.state, State.NONE);
  t.is(r.outcome, Outcome.NONE);
  t.is(r.total_voting_areas, 0);
  t.is(r.number_of_results, 0);
  t.is(r.tied_voting_areas, 0);
  t.is(r.leave_voting_areas, 0);
  t.is(r.remain_voting_areas, 0);
  t.is(r.incomplete_counts.length, 0);
  t.is(r.complete_counts.length, 0);
});
