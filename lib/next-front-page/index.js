import path from 'path';
import fs from 'fs';
import bluebird from 'bluebird';
import _ from 'lodash';
import nunjucks from 'nunjucks';

bluebird.promisifyAll(fs);

export default function () {

  const config = [{
    "tabs": ["national", "markets", "regional"],
    "note": "[DEFAULT]",
    "link": ""
  }];


  config.tabs = (Array.isArray(config) && Array.isArray(config.tabs) ? config[0].tabs : []).map(d => {
    return typeof d === 'string' ? d.toLowerCase().trim() : null;
  });

  const str = nunjucks.render('./template.json', config);

  return fs.writeFileAsync(file, str, {encoding: 'utf-8'});
}
