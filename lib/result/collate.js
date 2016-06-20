import * as override from './override';
import {all_voting_areas} from './voting-area';
import {all_regions} from './region';
import {national} from './national';

export default async function collate(results_dir, override_dir) {
  // get all the override data
  // for Voting Areas, Regions and the National totals
  const overrides = await override.load(override_dir);

  // load and parse all the voting_area data
  const voting_areas = await all_voting_areas(results_dir);

  // override the voting area values
  const overridden_areas = override.apply(voting_areas, overrides.areas, override.voting_area, 'ons_id', 'ons');

  // rollup the voting_areas to regions and regional reference data
  const regions = await all_regions(overridden_areas);

  // override the regions
  // the include will overriding both lower-level
  // voting area overrides and rollup totals.
  const overridden_regions = override.apply(regions, overrides.regions, override.region, 'id', 'ons');

  // load and parse the national running totals xml
  // and do an optional rollup
  const nationals = await national(overridden_areas, results_dir)

  // override region data, overwriting PA data and rollup calculations
  const overridden_nationals = override.national(nationals, overrides.national[0]);

  return {
    voting_areas: overridden_areas,
    regions: overridden_regions,
    national: overridden_nationals
  };
}
