import path from 'path';
import bluebird from 'bluebird';
import fs from 'fs';
import _ from 'lodash';

import Outcome from '../outcome';
import State from '../state';
import MessageType from './message-type';
import parse_filename from './filename';
import {parse_voting_area_file} from './xml';

bluebird.promisifyAll(fs);


export function apply_pa_messages(voting_area, messages) {
  let {recount, result, rush} = remove_superseded_messages(messages);
  let recent = select_most_valid_data(rush, result);

  const o = {
    ...voting_area,
    outcome: recent.outcome || Outcome.NONE,
    remain_votes: null_if_not_numeric(recent.remain_votes),
    remain_percentage_share: null_if_not_numeric(recent.remain_percentage_share),
    leave_votes: null_if_not_numeric(recent.leave_votes),
    leave_percentage_share: null_if_not_numeric(recent.leave_percentage_share),
    majority: null_if_not_numeric(recent.majority),
    percentage_majority: null_if_not_numeric(recent.percentage_majority),
    electorate: recent.electorate || null,
    turnout: recent.turnout || null,
    declaration_time: recent.declaration_time || null,
    percentage_turnout: recent.percentage_turnout || null,
    rush_revisions: rush.revision,
    result_revisions: result.revision,
    recount_revisions: recount.revision,
    recount_pending: (recount.revision > 0 && recount.file_modified > result.file_modified),
    num_recounts: null_if_not_numeric(recount.recount),
  };

  const has_turnout = (typeof o.turnout === 'number' && o.turnout > 0);
  const has_numbers = (typeof o.remain_votes === 'number' &&
                      typeof o.leave_votes === 'number' &&
                      // At least one side must have votes
                      Math.max(o.leave_votes, o.remain_votes) > 0);

  if (has_numbers && o.rush_revisions > o.result_revisions) {
    o.state = State.RESULT_OLD;
  } else if (has_numbers) {
    o.state = State.RESULT;
  } else if (o.outcome !== Outcome.NONE) {
    o.state = State.OUTCOME;
  } else if (has_turnout) {
    o.state = State.TURNOUT;
  } else {
    o.state = State.NONE;
  }

  o.count_error = !has_numbers ? 0 : (o.remain_votes + o.leave_votes - o.turnout);

  return o;

}

function select_most_valid_data(rush, result) {

  if (result.revision >= rush.revision) {
    return result;
  }

  // if the main result changed in a subsequenct rush
  // message then dont use old data, to be on the safe side
  if (rush.revision > result.revision && rush.outcome !== result.outcome) {
    return rush;
  }

  // safely use old data and new data combined
  return _.extend(result, rush);
}

function null_if_not_numeric(val) {
  return Number.isFinite(val) ? val : null;
}

function remove_superseded_messages(messages) {
  let recount;
  let result;
  let rush;
  const copy = messages.slice(0).sort((a, b) => b.revision - a.revision);

  for (let d of copy) {
    if (d.type === MessageType.RUSH) {
      rush = !rush || d.revision > rush.revision ? d : rush;
    } else if (d.type === MessageType.RECOUNT) {
      recount = !recount || d.revision > recount.revision ? d : recount;
    } else if (d.type === MessageType.RESULT) {
      result = !result || d.revision > result.revision ? d : result;
    }
  }

  return {
    recount: recount || { revision: 0, recount: 0 },
    rush: rush || { revision: 0},
    result: result || { revision: 0}
  };
}

export async function all_voting_area_messages(dir) {
  const data = [];
  for (let {filename, type, mtime} of await list_voting_area_messages(dir)) {
    data.push({
      ...await parse_voting_area_file(path.join(dir, filename), type),
      file_modified: mtime,
      filename: filename,
      type: type,
    })
  }
  return data;
}

async function list_voting_area_messages(dir) {
  const ls = await fs.readdirAsync(dir).map(parse_filename).filter(f => f.is_voting_area);
  return _(ls)
          .zipWith(await bluebird.map(ls, f => fs.statAsync(path.join(dir, f.filename))), function(file,stat) {
            return {
              ...file,
              mtime: stat.mtime
            }
          });
}
