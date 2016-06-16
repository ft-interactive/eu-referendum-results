import path from 'path';
import bluebird from 'bluebird';
import fs from 'fs';
import _ from 'lodash';

import parse_filename from './filename';
import {parse_running_totals} from './xml';

bluebird.promisifyAll(fs);

export async function list_running_totals(dir) {
  const ls = await fs.readdirAsync(dir);
  return _(ls).map(parse_filename)
              .filter(f => f.is_running_totals)
              .sortBy('revision')
              .value();
}

export async function all_running_totals(dir) {
  return bluebird.map(
    await list_running_totals(dir),
    map_parse_file(dir, parse_running_totals)
  );
}

export async function lastest_running_totals(dir) {
  return map_parse_file(dir, parse_running_totals)(
    _.last(await list_running_totals(dir))
  );
}

function map_parse_file(dir, parser) {
  return async function(file) {
    if (!file) return null;
    const contents = await fs.readFileAsync(path.join(dir, file.filename), 'utf-8');
    if (!contents) return null;
    const data = await parser(contents);
    return data;
    // return {
    //   ...data,
    //   revision: file.revision
    // }
  }
}
