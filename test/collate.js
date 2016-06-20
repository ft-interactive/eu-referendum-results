import test from 'ava';
import collate from '../lib/result/collate';
import nat_rollup from './fixtures/rollup/national-rollup';
import reg_rollup from './fixtures/rollup/region-rollup';
import Facts from './fixtures/facts';

test('collate without empty overrides', async t => {

  const results_dir = 'fixtures/pa-ftp/partial-result';
  const override_dir = 'fixtures/override/none';
  const {
    voting_areas,
    regions,
    national,
  } = await collate(results_dir, override_dir);

  // console.dir(voting_areas.find(d => d.pa_id === '39'))

});

test('collate without basic overrides', async t => {

  const results_dir = 'fixtures/pa-ftp/partial-result';
  const override_dir = 'fixtures/override/basic';
  const {
    voting_areas,
    regions,
    national,
  } = await collate(results_dir, override_dir);

  t.is(national.leave_percentage_share, 45);
  t.is(national.remain_percentage_share, 55);
  t.true(national.manual_override);


  const o_pct = voting_areas.find(d => d.ons_id === 'E09000019');
  const o_abs = voting_areas.find(d => d.ons_id === 'E07000034');

  t.is(o_pct.remain_percentage_share, 52);
  t.is(o_pct.leave_percentage_share, 48);
  t.true(o_pct.manual_override);

  t.is(o_abs.remain_votes, 100000);
  t.is(o_abs.leave_votes, 200000);
  t.is(o_abs.turnout, 300000);
  t.is(o_abs.electorate, 333333);
  t.true(o_abs.manual_override);

  // Our fixture has overridden some numbers
  // on one region with a load of random numbers
  const o_reg = regions.find(d => d.id === 'E12000007');

  t.is(o_reg.remain_votes, 1000000);
  t.is(o_reg.leave_votes, 2000000);
  t.is(o_reg.turnout, 3000000);
  t.is(o_reg.electorate, 4000000);
  t.is(o_reg.remain_percentage_share, 70);
  t.is(o_reg.leave_percentage_share, 30);
  t.is(o_reg.percentage_turnout, 5);
  t.is(o_reg.majority, 11);
  t.true(o_reg.manual_override);

});
