import test from 'ava';

import State from '../lib/result/state';
import Outcome from '../lib/result/outcome';

import {override_voting_area} from '../lib/result/override';

import {create_voting_area} from '../lib/result/voting-area';

function create_test_voting_area(name, outcome, state, remain, leave, electorate) {
  const va = create_voting_area({ons_id: name, name: name, pa_id: name});
  va.remain_votes = remain;
  va.leave_votes = leave;
  va.turnout = remain + leave;
  va.remain_percentage_share = remain && va.turnout ? remain / va.turnout * 100 : 0;
  va.leave_percentage_share = leave && va.turnout ? leave / va.turnout * 100 : 0;
  va.electorate = electorate;
  va.state = state;
  va.outcome = outcome;
  va.manual_override = false;
  return va;
}

test('override turnout', async t => {

  const original = {
    remain: 200,
    leave: 100
  };

  const voting_area = create_test_voting_area('A', Outcome.REMAIN,
                                            State.RESULT,
                                            original.remain,
                                            original.leave, 500);
  // arbitrarily add 50 to the turnout
  const override = {
    turnout: voting_area.turnout + 50
  };

  const calculated = {
    percentage_turnout: override.turnout / voting_area.electorate * 100,
    remain_percentage_share: original.remain / override.turnout * 100,
    leave_percentage_share: original.leave / override.turnout * 100
  };

  const data = await override_voting_area(voting_area, override);

  t.is(data.turnout, override.turnout);
  t.is(data.percentage_turnout, calculated.percentage_turnout);
  t.is(data.remain_percentage_share, calculated.remain_percentage_share);
  t.is(data.leave_percentage_share, calculated.leave_percentage_share);
  t.true(data.manual_override);

  // console.dir(data);
});

test('override turnout and electorate without remain leave numbers', async t => {

  const voting_area = create_test_voting_area('A', Outcome.REMAIN,
                                            State.OUTCOME, 0, 0, 0);
  const override = {
    turnout: 100,
    electorate: 200
  };

  const data = await override_voting_area(voting_area, override);

  t.is(data.turnout, override.turnout);
  t.is(data.electorate, override.electorate);
  t.is(data.percentage_turnout, 50);
  t.is(data.remain_percentage_share, 0);
  t.is(data.leave_percentage_share, 0);
  t.true(data.manual_override);

  // console.dir(data);
});

test('override turnout, remain and leave numbers', async t => {

  const voting_area = create_test_voting_area('A', Outcome.REMAIN,
                                            State.OUTCOME, 100, 200, 800);
  const override = {
    leave_votes: 200,
    remain_votes: 300,

    // turnout intentionally doesnt
    // sum leave and remain votes
    turnout: 550
  };

  const calculated_values = {
    percentage_turnout: override.turnout / voting_area.electorate * 100,
    leave_percentage_share: override.leave_votes / override.turnout * 100,
    remain_percentage_share: override.remain_votes / override.turnout * 100
  };

  const data = await override_voting_area(voting_area, override);

  t.is(data.leave_votes, override.leave_votes);
  t.is(data.remain_votes, override.remain_votes);
  t.is(data.turnout, override.turnout);
  t.is(data.electorate, voting_area.electorate);
  t.is(data.percentage_turnout, calculated_values.percentage_turnout);
  t.is(data.remain_percentage_share, calculated_values.remain_percentage_share);
  t.is(data.leave_percentage_share, calculated_values.leave_percentage_share);
  t.true(data.manual_override);

});

test('override just leave votes', async t => {

  const original = {
    leave_votes: 100,
    remain_votes: 50
  };

  const voting_area = create_test_voting_area('A', Outcome.LEAVE,
                                            State.RESULT, original.remain_votes, original.leave_votes, 200);
  const override = {
    leave_votes: 200
  };

  const new_turnout = override.leave_votes + original.remain_votes;

  const calulated_values = {
    leave_percentage_share: override.leave_votes / new_turnout * 100,
    remain_percentage_share: original.remain_votes / new_turnout * 100
  };

  const data = await override_voting_area(voting_area, override);

  t.is(data.leave_votes, override.leave_votes);
  t.is(data.turnout, new_turnout);
  t.is(data.leave_percentage_share, calulated_values.leave_percentage_share);
  t.is(data.remain_percentage_share, calulated_values.remain_percentage_share);
  t.is(data.majority, Math.abs(original.remain_votes - override.leave_votes));
  t.true(data.manual_override);
});


test('override just remain votes', async t => {

  const original = {
    remain_votes: 100,
    leave_votes: 50
  };

  const voting_area = create_test_voting_area('A', Outcome.LEAVE,
                                            State.RESULT, original.remain_votes, original.leave_votes, 200);
  const override = {
    remain_votes: 200
  };

  const new_turnout = override.remain_votes + original.leave_votes;

  const calulated_values = {
    leave_percentage_share: original.leave_votes / new_turnout * 100,
    remain_percentage_share: override.remain_votes / new_turnout * 100
  };

  const data = await override_voting_area(voting_area, override);

  t.is(data.remain_votes, override.remain_votes);
  t.is(data.turnout, new_turnout);
  t.is(data.leave_percentage_share, calulated_values.leave_percentage_share);
  t.is(data.remain_percentage_share, calulated_values.remain_percentage_share);
  t.is(data.majority, Math.abs(override.remain_votes - original.leave_votes));
  t.true(data.manual_override);
});


test('no override empty object data', async t => {
  const voting_area = create_test_voting_area('A', Outcome.REMAIN, State.RESULT, 100, 50, 200);
  const data = await override_voting_area(voting_area, {});
  t.deepEqual(data, voting_area);
  t.false(data.manual_override);
});

test('no override data', async t => {
  const voting_area = create_test_voting_area('A', Outcome.REMAIN, State.RESULT, 100, 50, 200);
  const data = await override_voting_area(voting_area, null);
  t.deepEqual(data, voting_area);
  t.false(data.manual_override);
});

test('nulls', async t => {
  const voting_area = create_test_voting_area('A', null, null, null, null, null);
  const data = await override_voting_area(voting_area, null);
  t.deepEqual(data, voting_area);
  t.false(data.manual_override);
});

test('no data', async t => {
  const voting_area = create_test_voting_area('A', null, null, null, null, null);
  const data = await override_voting_area(null, voting_area);
  t.is(data, null);
});
