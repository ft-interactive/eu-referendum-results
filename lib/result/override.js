/*

download override sreadsheet
merge onto dataset

*/

import Outcome from './outcome';
import State from './state';


export async function load_override_data() {
 return
}

export async function override_voting_area(data, override) {

  if (!data || !override) {
    return data;
  }

  const changes = {
    outcome: false,
    remain_votes: false,
    leave_votes: false,
    turnout: false,
    electorate: false,
    majority: false,
    percentage_majority: false,
    remain_percentage_share: false,
    leave_percentage_share: false,
    percentage_turnout: false,
    state: false,
  };

  if (Number.isFinite(override.remain_votes) &&
              data.remain_votes !== override.remain_votes) {
    data.remain_votes = override.remain_votes;
    changes.remain_votes = true;
  }

  if (Number.isFinite(override.leave_votes) &&
                data.leave_votes !== override.leave_votes) {
    data.leave_votes = override.leave_votes;
    changes.leave_votes = true;
  }

  if (Number.isFinite(override.turnout) &&
                data.turnout !== override.turnout) {
    data.turnout = override.turnout;
    changes.turnout = true;
  } else if (changes.leave_votes || changes.remain_votes) {
    data.turnout = data.leave_votes + data.remain_votes;
    changes.turnout = true;
  }

  if (Number.isFinite(override.electorate) &&
                data.electorate !== override.electorate) {
    data.electorate = override.electorate;
    changes.electorate = true;
  }

  if (changes.electorate || changes.turnout) {
    data.percentage_turnout = (data.electorate > 0 && data.turnout > 0) ?
                                  (data.turnout / data.electorate * 100) : 0;
    changes.percentage_turnout = true;
  }

  if (override.outcome) {
    const o = override.outcome.toUpperCase().trim();
    const new_outcome = (o === Outcome.TIED || o === Outcome.LEAVE || o === Outcome.REMAIN) ?
                    o : o === 'NONE' ? Outcome.NONE : data.outcome;
    changes.outcome = new_outcome !== data.outcome;
    data.outcome = new_outcome;
  }

  if (Number.isFinite(override.majority) &&
                data.majority !== override.majority) {
    data.majority = override.majority;
    changes.majority = true;
  } else if (changes.leave_votes || changes.remain_votes) {
    data.majority = Math.abs(data.remain_votes - data.leave_votes);
    changes.majority = true;
  }

  if (Number.isFinite(override.remain_percentage_share) ||
                  Number.isFinite(override.leave_percentage_share)) {
    // TODO:
    // data.remain_percentage_share = 100 - leave value
    // data.leave_percentage_share = 100 - remain value
    // changes.leave_percentage_share = change.remain_percentage_share = true;
  } else {
    if (changes.remain_votes || changes.turnout) {
      data.remain_percentage_share = data.remain_votes / data.turnout * 100;
      changes.remain_percentage_share = true;
    }

    if (changes.leave_votes || changes.turnout) {
      data.leave_percentage_share = data.leave_votes / data.turnout * 100;
      changes.leave_percentage_share = true;
    }

    // TODO: ensure they sum to 0 or 100
  }

  // TODO: override state

  if (changes.remain_percentage_share || changes.leave_percentage_share) {
    data.percentage_majority = Math.abs(data.remain_percentage_share - data.leave_percentage_share);
    changes.percentage_majority = true;
  }

  if (override.recount_pending) {
    data.recount_pending = override.recount_pending === true || override.recount_pending.lowerCase().trim() === 'true';
  }

  for (let prop in changes) {
    if (changes[prop]) {
      data.manual_override = true;
      break;
    }
  }

  return data;
}
