import _ from 'lodash';

import Outcome from './outcome';
import State from './state';

import {voting_areas, voting_area_age, voting_area_population} from './reference-data';
import {apply_pa_messages, all_voting_area_messages} from './pa/voting-area';
import {override_voting_area} from './override';

export async function all_voting_areas(dir, overrides) {

  const all_messages = _.groupBy(await all_voting_area_messages(dir), 'number');

  let overrides_index;
  let apply_override = Array.isArray(overrides) && overrides.length;

  if (apply_override) {
    overrides_index = _.keyBy(overrides, 'ons_id');
  }

  return (await voting_areas())
    .map(create_voting_area)
    .map(area => {
      const messages = all_messages[area.pa_id];

      if (messages) {
        area = apply_pa_messages(area, messages);
      }

      if (apply_override) {
        const override_data = overrides_index[area.ons_id];
        if (override_data) {
          console.log('%s has override data', area.ons_id);
          area = override_voting_area(area, override_data);
        }
      }

      return area;

    });

}

export async function all_voting_areas_with_census(dir) {
  const [results, ages, populations] = await Promise.all([
    all_voting_areas(dir),
    voting_area_age(),
    voting_area_population()
  ]);

  const age_index = _.keyBy(ages, 'ons_id');
  const population_index = _.keyBy(populations, 'ons_id');

  return results.map(voting_area => {
    const age = age_index[voting_area.ons_id] || {};
    const population = population_index[voting_area.ons_id] || {};
    return {
      ...voting_area,
      ...age,
      ...population
    }
  });

}

export function create_voting_area(row) {
  return {
    ons_id: row.ons_id,
    name: row.name,
    outcome: Outcome.NONE,
    state: State.NONE,
    remain_votes: null,
    remain_percentage_share: null,
    leave_votes: null,
    leave_percentage_share: null,
    majority: null,
    percentage_majority: null,
    electorate: null,
    turnout: null,
    percentage_turnout: null,
    declaration_time: null,
    rush_revisions: 0,
    result_revisions: 0,
    recount_revisions: 0,
    recount_pending: false,
    num_recounts: 0,
    manual_override: false,
    pa_id: row.pa_id,
    region_id: row.ons_regional_id,
    region_name: row.region_name,
    count_error: 0
  }
}
