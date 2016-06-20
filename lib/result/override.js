import Outcome from './outcome';
import State from './state';
import {percent, majority} from './calc';

import path from 'path';
import fs from 'fs';
import bluebird from 'bluebird';
import _ from 'lodash';

bluebird.promisifyAll(fs);

export async function load(dir) {
 const data = JSON.parse(await fs.readFileAsync(
   path.join(dir, 'override.json'),
   'utf-8'
 ));

 return data;
}

export function apply(dataset, overrides, func, key, key2) {

  const can_override = Array.isArray(dataset) &&
                       dataset.length &&
                       Array.isArray(overrides) &&
                       overrides.length;

  if (!can_override) {
    return dataset;
  }

  if (!key2) {
    key2 = key;
  }

  const index = _.keyBy(overrides, key2);

  return dataset.map(d => func(d, index[d[key]]));
}

export function region(data, override) {

  if (!data || !override) {
    return data;
  }

  data = voting_area(data, override);

  const changes = {
    number_of_results: false,
    remain_voting_areas: false,
    leave_voting_areas: false,
    tied_voting_areas: false
    // count_error
    // awiaiting number_of_results
    // awiting reports
    // recounts pending

    // incomplete complete counts array
    // complete counts array
  };

  if (is_not_negative(override.numresults)) {
    data.number_of_results = override.numresults;
    changes.number_of_results = true;
  }

  if (is_not_negative(override.numremain)) {
    data.remain_voting_areas = override.numremain;
    changes.remain_voting_areas = true;
  }

  if (is_not_negative(override.numleave)) {
    data.leave_voting_areas = override.numleave;
    changes.leave_voting_areas = true;
  }

  if (is_not_negative(override.numtied)) {
    data.tied_voting_areas = override.numtied;
    changes.tied_voting_areas = true;
  }

  if (typeof data.manual_override === 'undefined') {
    data.manual_override = false;
  }

  for (let prop in changes) {
    if (changes[prop]) {
      data.manual_override = true;
      break;
    }
  }

  return data;
}

export function national(data, override) {

  if (!data || !override) {
    return data;
  }

  // piggyback on the overriding behaviour for voting areas and regions
  // as they are almost identical logic

  data = region(data, override);

  return data;
}

export function voting_area(data, override) {

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

  if (is_not_negative(override.remain) &&
              data.remain_votes !== override.remain) {
    data.remain_votes = override.remain;
    changes.remain_votes = true;
  }

  if (is_not_negative(override.leave) &&
                data.leave_votes !== override.leave) {
    data.leave_votes = override.leave;
    changes.leave_votes = true;
  }

  if (is_not_negative(override.turnout) &&
                data.turnout !== override.turnout) {
    data.turnout = override.turnout;
    changes.turnout = true;
  } else if (changes.leave_votes || changes.remain_votes) {
    data.turnout = data.leave_votes + data.remain_votes;
    changes.turnout = true;
  }

  if (is_not_negative(override.electorate) &&
                data.electorate !== override.electorate) {
    data.electorate = override.electorate;
    changes.electorate = true;
  }

  if (is_not_negative(override.turnoutpct)) {
    data.percentage_turnout = override.turnoutpct;
    changes.percentage_turnout = true;
  } else if (changes.electorate || changes.turnout) {
    data.percentage_turnout = percent(data.turnout, data.electorate);
    changes.percentage_turnout = true;
  }

  if (is_not_negative(override.majority) &&
                data.majority !== override.majority) {
    data.majority = override.majority;
    changes.majority = true;
  } else if (changes.leave_votes || changes.remain_votes) {
    data.majority = majority(data.remain_votes, data.leave_votes);
    changes.majority = true;
  }

  if (is_not_negative(override.remainpct)) {
    data.remain_percentage_share = override.remainpct;
    changes.remain_percentage_share = true;
  } else if (is_not_negative(override.leavepct)) {
    data.leave_percentage_share = override.leavepct;
    changes.leave_percentage_share = true;
  } else {
    if (changes.remain_votes || changes.turnout) {
      data.remain_percentage_share = percent(data.remain_votes, data.turnout);
      changes.remain_percentage_share = true;
    }

    if (changes.leave_votes || changes.turnout) {
      data.leave_percentage_share = percent(data.leave_votes, data.turnout);
      changes.leave_percentage_share = true;
    }
  }

  if (changes.leave_percentage_share && !changes.remain_percentage_share) {
    data.remain_percentage_share = 100 - data.leave_percentage_share;
    changes.remain_percentage_share = true;
  } else if (!changes.leave_percentage_share && changes.remain_percentage_share) {
    data.leave_percentage_share = 100 - data.remain_percentage_share
    changes.leave_percentage_share = true;
  }

  if (changes.remain_percentage_share || changes.leave_percentage_share) {
    data.percentage_majority = majority(data.remain_percentage_share, data.leave_percentage_share);
    changes.percentage_majority = true;
  }

  if (override.recountpending) {
    data.recount_pending = override.recountpending === true || override.recountpending.lowerCase().trim() === 'true';
  }

  if (typeof override.outcome === 'string') {
    const o = override.outcome.toUpperCase().trim();
    const new_outcome = Outcome.hasOwnProperty(o) ? Outcome[o] : data.outcome;
    changes.outcome = new_outcome !== data.outcome;
    data.outcome = new_outcome;
  }
  // TODO: calc override outcome

  if (Number.isFinite(override.state)) {
    data.state = override.state;
    changes.state = true;
  } else if (typeof override.state === 'string'
                  && State.hasOwnProperty(override.state.toUpperCase())) {
    data.state = State[override.state.toUpperCase()];
    changes.state = true;
  }
  // TODO: calc override state

  for (let prop in changes) {
    if (changes[prop]) {
      data.manual_override = true;
      break;
    }
  }

  return data;
}

function is_not_negative(num) {
  return Number.isFinite(num) && num >= 0;
}

function is_positive(num) {
  return Number.isFinite(num) && num >= 1;
}
