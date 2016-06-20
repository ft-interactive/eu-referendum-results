import test from 'ava';
import fs from 'fs';
import bluebird from 'bluebird';

import Outcome from '../lib/result/outcome';

import {parse_rush, parse_result,
        parse_recount, parse_running_totals} from '../lib/result/pa/xml';

bluebird.promisifyAll(fs);

const dir = 'fixtures/pa-ftp/results';
const fixture = (filename) => fs.readFileAsync(`${dir}/${filename}.xml`, 'utf-8');

const running_total_fixture_files = {
  first_update: 'EU_running_totals_15',
  during_the_night: 'EU_running_totals_377',
  last_update: 'EU_running_totals_382'
}

test('Recount', async t => {
  const o = await parse_recount(await fixture('EU_recount_Aylesbury_Vale_1'));
  t.deepEqual(o, {
    revision: 1,
    number: '12',
    name: 'Aylesbury Vale',
    recount: 1
  }, 'Matches values in the fixture XML file');
});

test('Result', async t => {
  const a = await parse_result(await fixture('EU_result_Aylesbury_Vale_1'));
  t.deepEqual(a, {
    revision: 1,
    declaration_time: new Date('2016-03-22T14:20:04+00:00'),
    number: '12',
    name: 'Aylesbury Vale',
    electorate: 135888,
    outcome: Outcome.LEAVE,
    turnout: 81343,
    percentage_turnout: 59.86,
    majority: 1099,
    percentage_majority: 1.35,
    remain_votes: 40122,
    remain_percentage_share: 49.32446553483397,
    leave_votes: 41221,
    leave_percentage_share: 50.67553446516603,
  }, 'Matches values in the fixture XML file');
});

test('Rush with tied result', async t => {
  const a = await parse_rush(await fixture('EU_rush_Doncaster_1'));
  t.deepEqual(a, {
    revision: 1,
    declaration_time: new Date('2016-03-22T16:04:58+00:00'),
    number: '92',
    name: 'Doncaster',
    electorate: 210826,
    outcome: Outcome.TIED
  }, 'Matches values in the fixture XML file');
});

test('Rush with correction after tied result', async t => {
  const a = await parse_rush(await fixture('EU_rush_Doncaster_2'));
  t.is(a.outcome, Outcome.REMAIN);
});

test('Running Totals', async t => {
  const totals = await parse_running_totals(await fixture(running_total_fixture_files.during_the_night));
  t.deepEqual(totals, {
    number_of_results: 377,
    total_voting_areas: 382,
    remain_voting_areas: 190,
    remain_votes: 12018187,
    remain_percentage_share: 50.05,
    leave_voting_areas: 185,
    leave_votes: 11995096,
    leave_percentage_share: 49.95,
    tied_voting_areas: 2
  })
});

test('Running Totals when no tied voting areas', async t => {
  const totals = await parse_running_totals(await fixture(running_total_fixture_files.first_update));
  t.is(totals.tied_voting_areas, 0);
});
