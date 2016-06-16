import test from 'ava';

import * as result from '../lib/result';

test.skip('refresh PA data', async t => {
  result.refresh_pa_data();
  t.fail();
});

test.skip('running totals', async t => {
  result.running_totals();
  t.fail();
});

test.skip('single voting area', async t => {
  result.voting_area('foobar');
  t.fail();
});

test.todo('single voting area with invalid GSS code');

test.skip('all voting areas', async t => {
  result.all_voting_areas();
  t.fail();
});

test.skip('single region', async t => {
  result.region('bar');
  t.fail();
});

test.todo('single region with invalid GSS code');

test.skip('all regions', async t => {
  result.all_regions();
  t.fail();
});
