import path from 'path';
import fs from 'fs';
import d3 from 'd3';
import bluebird from 'bluebird';
import collate from './collate';
import State from './state';

bluebird.promisifyAll(fs);

export default async function main(results_dir, override_dir, output_dir) {

  if (!results_dir) {
    throw new Error('PA XML directory required');
  }

  if (!override_dir) {
    throw new Error('override directory required');
  }

  if (!output_dir) {
    throw new Error('output directory required');
  }

  const {
    national,
    regions,
    voting_areas
  } = await collate(results_dir, override_dir);

  const completed_voting_areas = voting_areas.filter(d => d.state >= State.RESULT);
  const flat_regions = regions.map(flat_region);

  const all_written = await Promise.all([
    json_file(output_dir, 'full-national-results', national),
    json_file(output_dir, 'simple-national-results', simple_national(national)),
    json_file(output_dir, 'full-regional-results', regions),
    json_file(output_dir, 'voting-area-results', voting_areas),
    csv_file(output_dir, 'voting-area-results', voting_areas),
    csv_file(output_dir, 'completed-voting-area-results', completed_voting_areas),
    csv_file(output_dir, 'regions', flat_regions)
  ]);

}

function simple_national(d) {
  return {
    outcome: d.outcome,
    remain_percentage_share: d.remain_percentage_share,
    leave_percentage_share: d.leave_percentage_share,
    percentage_turnout: d.percentage_turnout,
    number_of_results: d.number_of_results,
    total_voting_areas: d.total_voting_areas,
    remain_votes: d.remain_votes,
    leave_votes: d.leave_votes,
    turnout: d.turnout,
    electorate: d.electorate,
    state: d.state,
  }
}

function flat_region(d) {
  return {
    id: d.id,
    name: d.name,
    remain_votes: d.remain_votes,
    leave_votes: d.leave_votes,
    leave_percentage_share: d.leave_percentage_share,
    remain_percentage_share: d.remain_percentage_share,
    turnout: d.turnout,
    percentage_turnout: d.percentage_turnout,
    electorate: d.electorate,
    outcome: d.outcome,
    state: d.state,
    majority: d.majority,
    total_voting_areas: d.total_voting_areas,
    number_of_results: d.number_of_results
  };
}

function csv_file(dir, name, data) {
  return fs.writeFileAsync(
    path.join(dir, name + '.csv'),
    d3.csv.format(data)
  );
}

function json_file(dir, name, data) {
  return fs.writeFileAsync(
    path.join(dir, name + '.json'),
    JSON.stringify(data)
  );
}
