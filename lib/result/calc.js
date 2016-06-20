import State from './state';
import Outcome from './outcome';

export function majority(a, b) {
  return Math.abs(a - b);
}

export function calculate_outcome(remain, leave) {
  return !remain && !leave ? Outcome.NONE :
    remain === leave ? Outcome.TIED :
    remain < leave ? Outcome.LEAVE :
    Outcome.REMAIN;
}

export function calculate_state(remain, leave, number_of_results, total_voting_areas) {
  return (!leave && !remain) ? State.NONE :
    number_of_results < total_voting_areas ? State.RUNNING_TOTAL :
    State.RESULT;
}

export function percentage_turnout(turnout, electorate) {
  return Math.min(percent(turnout, electorate), 100);
}

export function percent(a, b) {
  return Number.isFinite(a) && a >= 0 &&
         Number.isFinite(b) && b > 0 ? a / b * 100 : 0
}

export function percentage_share(remain, leave) {
  const total = remain + leave;
  return !total ? [0, 0] : [
    remain / total * 100,
    leave / total * 100
  ];
}
