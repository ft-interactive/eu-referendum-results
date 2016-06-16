import _ from 'lodash';
import {rollup_voting_areas} from './rollup';
import {regions} from './reference-data';

export async function all_regions(voting_areas) {

  const groups = _.groupBy(voting_areas, 'region_id');

  return (await regions()).map(region => {
                    return {
                      ...region,
                      ...rollup_voting_areas(groups[region.id] || [])
                    };
                });
}
