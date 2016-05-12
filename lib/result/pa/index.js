import path from 'path';
import xml2js from 'xml2js';
import bluebird from 'bluebird';

const xml = bluebird.promisify(xml2js.parseString);

export const ResultType = Enum('RUSH', 'RESULT', 'RECOUNT');

function doc_commondata(node) {
  return {
    revision: parseInt(node.$.revision),
    number: node.Referendum[0].VotingArea[0].$.number,
    name: node.Referendum[0].VotingArea[0].$.name
  };
}

function doc_common_count(node) {
  return {
    ...doc_commondata(node),
    declaration_time: new Date(node.$.declarationTime),
    electorate: parseInt(node.Referendum[0].VotingArea[0].$.electorate),
    vote_leave: node.Referendum[0].VotingArea[0].Proposition[0].$.winningAnswerText.startsWith('Leave'),
    vote_tied: node.Referendum[0].VotingArea[0].Proposition[0].$.winningAnswerText.startsWith('Tied'),
  };
}

export function parse_recount(str) {
  return xml(str).then(doc => {
    return {
      ...doc_commondata(doc.ReferendumRecount),
      recount: parseInt(doc.ReferendumRecount.Referendum[0].VotingArea[0].$.recount)
    };
  });
}

export function parse_result(str) {
  return xml(str).then(doc => {
    const proposition = doc.ReferendumResult.Referendum[0].VotingArea[0].Proposition[0];
    const leave = proposition.Answer.find(answer => /^Leave/.test(answer.$.shortText)).$;
    const remain = proposition.Answer.find(answer => /^Remain/.test(answer.$.shortText)).$;
    return {
      ...doc_common_count(doc.ReferendumResult),
      turnout: parseInt(proposition.$.turnout),
      percentage_turnout: parseFloat(proposition.$.percentageTurnout),
      majority: parseInt(proposition.$.majority),
      percentage_majority: parseFloat(proposition.$.percentageMajority),
      remain_votes: parseInt(remain.votes),
      remain_percentage_share: parseFloat(remain.percentageShare),
      leave_votes: parseInt(leave.votes),
      leave_percentage_share: parseFloat(leave.percentageShare)
    }
  })
}

export function parse_rush(str) {
  return xml(str).then(doc => {
    return {
      ...doc_common_count(doc.ReferendumRush)
    };
  });
}

export function parse_running_totals(str) {
  return xml(str).then(doc => {
    const remain = doc.RunningTotals.Referendum[0].Proposition[0].Answer.find(answer => answer.$.shortText.startsWith('Remain'));
    const leave = doc.RunningTotals.Referendum[0].Proposition[0].Answer.find(answer => answer.$.shortText.startsWith('Leave'))
    return {
      number_of_results: parseInt(doc.RunningTotals.$.numberOfResults),
      total_voting_areas: parseInt(doc.RunningTotals.$.totalVotingAreas),
      remain_voting_areas: parseInt(remain.$.votingAreas),
      remain_votes: parseInt(remain.$.votes),
      remain_percentage_share: parseFloat(remain.$.percentageShare),
      leave_voting_areas: parseInt(leave.$.votingAreas),
      leave_votes: parseInt(leave.$.votes),
      leave_percentage_share: parseFloat(leave.$.percentageShare),
    };
  });
}

export function parse_filename(filename) {
  const p = path.parse(filename);
  const parts = p.name.split(/_/g);
  const last_part = parts[parts.length - 1];
  const o = {filename: filename};
  o.is_eu_ref = parts[0] === 'EU';
  o.is_running_totals = o.is_eu_ref && parts[1] === 'running' && parts[2] === 'totals';
  o.is_voting_area = o.is_eu_ref && !o.is_running_totals;
  o.type = (o.is_voting_area && ResultType[parts[1].toUpperCase()]) || null;
  o.revision = /^\d+$/.test(last_part) ? parseInt(last_part) : null;
  o.name = o.is_voting_area ? parts.slice(2, parts.length - 1).join(' ') : null;
  return o;
}

function Enum(...vals) {
  return Object.freeze(vals.reduce((o,s) => {
    o[s] = Symbol(s);
    return o;
  }, {}));
}
