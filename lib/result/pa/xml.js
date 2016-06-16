import fs from 'fs';
import xml2js from 'xml2js';
import _ from 'lodash';
import bluebird from 'bluebird';
import MessageType from './message-type';
import Outcome from '../outcome';

const xml = bluebird.promisify(xml2js.parseString);
bluebird.promisifyAll(fs);

export async function parse_voting_area_file(file, type) {
  const xml = await fs.readFileAsync(file);
  switch(type) {
    case MessageType.RESULT:
      return parse_result(xml);
    case MessageType.RUSH:
      return parse_rush(xml);
    case MessageType.RECOUNT:
      return parse_recount(xml);
  }
}

function voting_area_metadata(node) {
  return {
    revision: parseInt(node.$.revision),
    number: node.Referendum[0].VotingArea[0].$.number,
    name: node.Referendum[0].VotingArea[0].$.name
  };
}

function voting_area_basic_result(node) {
  const answerText = node.Referendum[0].VotingArea[0].Proposition[0].$.winningAnswerText;
  return {
    declaration_time: new Date(node.$.declarationTime),
    electorate: parseInt(node.Referendum[0].VotingArea[0].$.electorate),
    outcome: (answerText.startsWith('Leave') ? Outcome.LEAVE :
            answerText.startsWith('Remain') ? Outcome.REMAIN :
            answerText.startsWith('Tied') ? Outcome.TIED : Outcome.NONE)
  };
}

export function parse_recount(str) {
  return xml(str).then(doc => {
    return {
      ...voting_area_metadata(doc.ReferendumRecount),
      recount: parseInt(doc.ReferendumRecount.Referendum[0].VotingArea[0].$.recount)
    };
  });
}

export function parse_result(str) {
  return xml(str).then(doc => {
    const proposition = doc.ReferendumResult.Referendum[0].VotingArea[0].Proposition[0];
    const leave = proposition.Answer.find(answer => answer.$.shortText.startsWith('Leave')).$;
    const remain = proposition.Answer.find(answer => answer.$.shortText.startsWith('Remain')).$;
    return {
      ...voting_area_metadata(doc.ReferendumResult),
      ...voting_area_basic_result(doc.ReferendumResult),
      turnout: parseInt(proposition.$.turnout),
      percentage_turnout: parseFloat(proposition.$.percentageTurnout),
      majority: parseInt(proposition.$.majority),
      percentage_majority: parseFloat(proposition.$.percentageMajority),
      remain_votes: parseInt(remain.votes),
      remain_percentage_share: parseFloat(remain.percentageShare),
      leave_votes: parseInt(leave.votes),
      leave_percentage_share: parseFloat(leave.percentageShare)
    };
  });
}

export function parse_rush(str) {
  return xml(str).then(doc => {
    return {
      ...voting_area_metadata(doc.ReferendumRush),
      ...voting_area_basic_result(doc.ReferendumRush)
    };
  });
}

export function parse_running_totals(str) {
  return xml(str).then(doc => {
    const remain = doc.RunningTotals.Referendum[0].Proposition[0].Answer.find(answer => answer.$.shortText.startsWith('Remain')).$;
    const leave = doc.RunningTotals.Referendum[0].Proposition[0].Answer.find(answer => answer.$.shortText.startsWith('Leave')).$;
    const tied_voting_areas = _.get(doc, 'RunningTotals.Referendum[0].Proposition[0].Tied[0].$.votingAreas', 0);
    return {
      number_of_results: parseInt(doc.RunningTotals.$.numberOfResults),
      total_voting_areas: parseInt(doc.RunningTotals.$.totalVotingAreas),
      remain_voting_areas: parseInt(remain.votingAreas),
      remain_votes: parseInt(remain.votes),
      remain_percentage_share: parseFloat(remain.percentageShare),
      leave_voting_areas: parseInt(leave.votingAreas),
      leave_votes: parseInt(leave.votes),
      leave_percentage_share: parseFloat(leave.percentageShare),
      tied_voting_areas: parseInt(tied_voting_areas)
    };
  });
}
