import Outcome from './outcome';
import State from './state';
import {majority, calculate_state, percentage_share,
        calculate_outcome, percentage_turnout} from './calc';

export function rollup_voting_areas(voting_areas) {

  const rollup = voting_areas.reduce((r, area) => {

    const partial_area = {
      ons_id: area.ons_id,
      name: area.name,
      outcome: area.outcome,
      remain_percentage_share: area.remain_percentage_share,
      leave_percentage_share: area.leave_percentage_share,
      pa_id: area.pa_id
    };

    if (area.state >= State.RESULT) {
      r.number_of_results++;
      switch (area.outcome) {
        case Outcome.TIED:
          r.tied_voting_areas++
          break;
        case Outcome.LEAVE:
          r.leave_voting_areas++
          break;
        case Outcome.REMAIN:
          r.remain_voting_areas++
          break;
      }
      r.complete_counts.push(partial_area);
    } else {
      if (area.state === State.OUTCOME) {
        r.awaiting_numbers++;
      } else {
        r.awaiting_reports++
      }
      r.incomplete_counts.push(partial_area);
    }
    r.turnout += (area.turnout || 0);
    r.electorate += (area.turnout ? area.electorate : 0);
    r.remain_votes += (area.remain_votes || 0);
    r.leave_votes += (area.leave_votes || 0);
    r.recounts_pending += (area.recount_pending ? 1 : 0);

    return r;
  }, create_rollup());

  rollup.percentage_turnout = percentage_turnout(rollup.turnout, rollup.electorate);

  const [remain_pct, leave_pct] = percentage_share(rollup.remain_votes, rollup.leave_votes);
  rollup.remain_percentage_share = remain_pct;
  rollup.leave_percentage_share = leave_pct;

  rollup.count_error = rollup.remain_votes + rollup.leave_votes - rollup.turnout;
  rollup.majority = majority(rollup.remain_votes, rollup.leave_votes);
  rollup.percentage_majority = majority(rollup.remain_percentage_share, rollup.leave_percentage_share);
  rollup.total_voting_areas = voting_areas.length

  rollup.outcome = calculate_outcome(rollup.remain_votes, rollup.leave_votes);

  rollup.state = calculate_state(rollup.remain_votes, rollup.leave_votes,
                                  rollup.number_of_results, rollup.total_voting_areas);

  rollup.projected_outcome = rollup.state === State.RESULT ? rollup.outcome : (
      (rollup.electorate - rollup.turnout) < rollup.majority ? rollup.outcome : Outcome.NONE
  );

  return rollup;

}

export function create_rollup() {
  return {
    outcome: Outcome.NONE,
    state: State.NONE,
    remain_votes: 0,
    remain_percentage_share: 0,
    leave_votes: 0,
    leave_percentage_share: 0,
    majority: 0,
    percentage_majority: 0,
    electorate: 0,
    turnout: 0,
    percentage_turnout: 0,
    manual_override: false,
    total_voting_areas: 0,
    count_error: 0,

    number_of_results: 0,
    remain_voting_areas: 0,
    leave_voting_areas: 0,
    tied_voting_areas: 0,
    awaiting_numbers: 0,
    awaiting_reports: 0,

    recounts_pending: 0,
    incomplete_counts: [],
    complete_counts: [],
    projected_outcome: Outcome.NONE
  };
}
