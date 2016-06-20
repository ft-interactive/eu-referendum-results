import test from 'ava';

import State from '../lib/result/state';
import Outcome from '../lib/result/outcome';

import {calculate_outcome, calculate_state, majority,
          percentage_share, percentage_turnout} from '../lib/result/calc';

test('tied outcome', async t => {
  t.is(calculate_outcome(0, 0), Outcome.NONE);
  t.is(calculate_outcome(100, 100), Outcome.TIED);
  t.is(calculate_outcome(200, 200), Outcome.TIED);
});

test('remain outcome', async t => {
  t.is(calculate_outcome(200, 0), Outcome.REMAIN);
  t.is(calculate_outcome(200, 199), Outcome.REMAIN);
});

test('leave outcome', async t => {
  t.is(calculate_outcome(0, 30), Outcome.LEAVE);
  t.is(calculate_outcome(100, 101), Outcome.LEAVE);
  t.is(calculate_outcome(999, 1000), Outcome.LEAVE);
});

test('no outcome', async t => {
  t.is(calculate_outcome(null, null), Outcome.NONE);
  t.is(calculate_outcome(0, 0), Outcome.NONE);
  t.is(calculate_outcome(undefined, 0), Outcome.NONE);
  t.is(calculate_outcome(null, 0), Outcome.NONE);
});

test('no state', async t => {
  t.is(calculate_state(null, null), State.NONE);
  t.is(calculate_state(null, null, 0, 0), State.NONE);
  t.is(calculate_state(0, 0, 0, 0), State.NONE);
  t.is(calculate_state(0, 0, 10, 10), State.NONE);
  t.is(calculate_state(0, 0, 9, 10), State.NONE);
});

test('result state', async t => {
  t.is(calculate_state(1, 1, 1, 1), State.RESULT);
  t.is(calculate_state(1, 1, 100, 100), State.RESULT);
  t.is(calculate_state(1, 1, 200, 100), State.RESULT);
  t.is(calculate_state(1, 1, 200, 200), State.RESULT);
});

test('running total state', async t => {
  t.is(calculate_state(1, 1, 9, 10), State.RUNNING_TOTAL);
  t.is(calculate_state(1, 1, 1, 10), State.RUNNING_TOTAL);
});

test('majority', async t => {
  t.is(majority(0, 0), 0);
  t.is(majority(1, 1), 0);
  t.is(majority(100, 100), 0);
  t.is(majority(1, 2), 1);
  t.is(majority(2, 1), 1);
  t.is(majority(0, 1), 1);
  t.is(majority(1, 0), 1);
  t.is(majority(200, 100), 100);
});

test('percentage share: null value', async t => {
  const [remain, leave] = percentage_share(100, null);
  t.is(remain, 100);
  t.is(leave, 0);
});

test('percentage share: no votes', async t => {
  const [remain, leave] = percentage_share(0, 0);
  t.is(remain, 0);
  t.is(leave, 0);
});

test('percentage share: 50% tie', async t => {
  const [remain, leave] = percentage_share(111111, 111111);
  t.is(remain, 50);
  t.is(leave, 50);
});

test('percentage share: 0% remain, 100% leave', async t => {
  const [remain, leave] = percentage_share(0, 10);
  t.is(remain, 0);
  t.is(leave, 100);
});

test('percentage share: 100% remain, 0% leave', async t => {
  const [remain, leave] = percentage_share(10, 0);
  t.is(remain, 100);
  t.is(leave, 0);
});

test('percentage share: 40% remain, 60% leave', async t => {
  const [remain, leave] = percentage_share(4000, 6000);
  t.is(remain, 40);
  t.is(leave, 60);
});

test('percentage turnout', async t => {
  t.is(percentage_turnout(400, 1000), 40, '40% turnout');
  t.is(percentage_turnout(0, 1000), 0, '0% turnout');
  t.is(percentage_turnout(1000, 1000), 100, '100% turnout');
  t.is(percentage_turnout(null, 1000), 0, 'null turnout');
  t.is(percentage_turnout(1000, null), 0, 'null electorate');
  t.is(percentage_turnout(null, null), 0, 'no data');
  t.is(percentage_turnout(2000, 1000), 100, 'max 100%');
  t.is(percentage_turnout(-100, 1000), 0, 'min 0% with negative turnout');
  t.is(percentage_turnout(100, -1000), 0, 'min 0% with negative electorate');
});
