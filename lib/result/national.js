import _ from 'lodash';
import {rollup_voting_areas} from './rollup';
import {lastest_running_totals} from './pa/running-totals';

export async function national(voting_areas, dir) {
  const running_totals = await lastest_running_totals(dir);
  const rollup = rollup_voting_areas(voting_areas);
  return {
    ...running_totals,
    ...rollup
  }
}
