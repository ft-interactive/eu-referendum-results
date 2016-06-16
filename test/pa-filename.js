import test from 'ava';
import parse_filename from '../lib/result/pa/filename';
import MessageType from '../lib/result/pa/message-type';

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
  t.is(parse_filename('EU_rush_Aylesbury_Vale_1.xml').type, MessageType.RUSH);
  t.is(parse_filename('EU_recount_Aylesbury_Vale_1.xml').type, MessageType.RECOUNT);
  t.is(parse_filename('EU_result_Aylesbury_Vale_1.xml').type, MessageType.RESULT);
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
