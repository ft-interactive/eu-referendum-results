import test from 'ava';
import {parse_filename, ResultType, parse_recount, parse_rush, parse_result, parse_running_totals} from '../lib/result/pa';
import fs from 'fs';
import bluebird from 'bluebird';

const read = bluebird.promisify(fs.readFile);
const fixture = filename => read(`fixtures/pa-ftp/results/${filename}.xml`, 'utf-8');

test('parse recount xml', async t => {
  const o = await parse_recount(await fixture('EU_recount_Aylesbury_Vale_1'));
  t.deepEqual(o, {
    revision: 1,
    number: '12',
    name: 'Aylesbury Vale',
    recount: 1
  });
});

test('parse result xml', async t => {
  const a = await parse_result(await fixture('EU_result_Aylesbury_Vale_1'));
  t.deepEqual(a, {
    revision: 1,
    declaration_time: new Date('2016-03-22T14:20:04+00:00'),
    number: '12',
    name: 'Aylesbury Vale',
    electorate: 135888,
    vote_leave: true,
    vote_tied: false,
    turnout: 81343,
    percentage_turnout: 59.86,
    majority: 1099,
    percentage_majority: 1.35,
    remain_votes: 40122,
    remain_percentage_share: 49.32,
    leave_votes: 41221,
    leave_percentage_share: 50.68
  });
});

test('parse rush xml', async t => {
  const a = await parse_rush(await fixture('EU_rush_Doncaster_1'));
  t.deepEqual(a, {
    revision: 1,
    declaration_time: new Date('2016-03-22T16:04:58+00:00'),
    number: '92',
    name: 'Doncaster',
    electorate: 210826,
    vote_leave: false,
    vote_tied: true
  });
});

test('tied rush', async t => {
  const a = await parse_rush(await fixture('EU_rush_Doncaster_2'));
  t.false(a.vote_leave);
  t.false(a.vote_tied);
});

test('parse running totals', async t => {
  const totals = await parse_running_totals(await fixture('EU_running_totals_377'));
  t.deepEqual(totals, {
    number_of_results: 377,
    total_voting_areas: 382,
    remain_voting_areas: 190,
    remain_votes: 12018187,
    remain_percentage_share: 50.05,
    leave_voting_areas: 185,
    leave_votes: 11995096,
    leave_percentage_share: 49.95,
  })
});

test('parse_filename().is_eu_ref', t => {
  t.false(parse_filename('').is_eu_ref);
  t.false(parse_filename('foobar').is_eu_ref);
  t.true(parse_filename('EU_recount_Aylesbury_Vale_1.xml').is_eu_ref);
  t.true(parse_filename('EU_running_totals_126.xml').is_eu_ref);
  t.false(parse_filename('Welsh_Assembly_Test_rush_Newport_East_1.xml').is_eu_ref);
});

test('parse_filename().is_running_totals', t => {
  t.true(parse_filename('EU_running_totals_126.xml').is_running_totals);
  t.false(parse_filename('EU_recount_Aylesbury_Vale_1.xml').is_running_totals);
  t.false(parse_filename('London_Mayor_running_totals_1.xml').is_running_totals);
});

test('parse_filename().is_voting_area', t => {
  t.true(parse_filename('EU_recount_Aylesbury_Vale_1.xml').is_voting_area);
  t.false(parse_filename('EU_running_totals_126.xml').is_voting_area);
  t.false(parse_filename('London_Mayor_running_totals_1.xml').is_voting_area);
  t.false(parse_filename('foobar.xml').is_voting_area);
});

test('parse_filename().type', t => {
  t.is(parse_filename('EU_rush_Aylesbury_Vale_1.xml').type, ResultType.RUSH);
  t.is(parse_filename('EU_recount_Aylesbury_Vale_1.xml').type, ResultType.RECOUNT);
  t.is(parse_filename('EU_result_Aylesbury_Vale_1.xml').type, ResultType.RESULT);
  t.falsy(parse_filename('EU_foo_Aylesbury_Vale_1.xml').type);
  t.falsy(parse_filename('EU_running_totals_126.xml').type);
  t.falsy(parse_filename('London_Mayor_running_totals_1.xml').type);
  t.falsy(parse_filename('foobar.xml').type);
});

test('parse_filename().revision', t => {
  t.is(parse_filename('EU_running_totals_126.xml').revision, 126);
  t.is(parse_filename('EU_recount_Aylesbury_Vale_1.xml').revision, 1);
  t.is(parse_filename('EU_result_Aylesbury_Vale_1.xml').revision, 1);
  t.is(parse_filename('London_Mayor_running_totals_1.xml').revision, 1);
  t.falsy(parse_filename('foobar.xml').revision);
});

test('parse_filename().name', t => {
  t.is(parse_filename('EU_result_Foo_1.xml').name, 'Foo');
  t.is(parse_filename('EU_recount_Foo_Bar_1.xml').name, 'Foo Bar');
  t.is(parse_filename('EU_rush_Foo_Bar_Baz_1.xml').name, 'Foo Bar Baz');
  t.falsy(parse_filename('EU_running_totals_126.xml').name);
  t.falsy(parse_filename('London_Mayor_running_totals_1.xml').name);
  t.falsy(parse_filename('foobar.xml').name);
});
