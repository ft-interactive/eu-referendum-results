import path from 'path';
import fs from 'fs';
import bluebird from 'bluebird';
import _ from 'lodash';
import nunjucks from 'nunjucks';

bluebird.promisifyAll(fs);

export default async function init(output_dir, data) {



  // Tabs appear in the order specified in
  // the config array.
  //
  // Tabs ids
  //  - markets
  //  - national
  //  - regional
  const default_config = {
    tabs: 'markets',
    note: '[DEFAULT]',
    link: '',
    bigLinkText: null,
    bigLinkUrl: null,
    ticker: 'none'
  };

  const config = !data.config ? default_config : {
    ...default_config,
    ...data.config
  };

  // Results
  config.leave = data.national.leave_percentage_share;
  config.remain = data.national.remain_percentage_share;
  config.individualResults = [];

  if (config.ticker === 'area') {
    config.individualResults = data.voting_areas.filter(d => {
      return (d.declaration_time &&
              d.declaration_time instanceof Date &&
              d.outcome);
    }).sort((a,b) => {
      return b.declaration_time.getTime() - a.declaration_time.getTime();
    }).slice(0, 100).map(area => {
      return {
        name: area.name,
        label: area.outcome
      }
    });
  } else if (config.ticker === 'region') {
    config.individualResults = data.regions.map(region => {
      if (!region.outcome) return;
      return {
        name: region.short_name,
        label: region.outcome
      }
    }).filter(Boolean);
  }



  const default_note = '<strong>' + (data.national.total_voting_areas - data.national.number_of_results) + '</strong> voting areas still to be counted'
  config.note = !config.note ? default_note : (config.note === '[NONE]' ? '' : config.note.replace('[DEFAULT]', default_note));
  config.note = config.note.replace(/[\n\r]+/g, '<br/>');

  // markets SVGs
  config.svgDir = process.env.PUBLIC_DATA_DIR || './';

  config.marketVariant = config.marketVariant || 'night';

  config.def = config.def || (config.marketVariant + "2-homepage-default");
  config.small = config.small || (config.marketVariant + "2-homepage-small");
  config.medium = config.medium || (config.marketVariant + "-homepage-medium");
  config.large = config.large || (config.marketVariant + "-homepage-large");
  config.xlarge = config.xlarge || (config.marketVariant + "-homepage-xlarge");

  config.resultsUrl = 'https://ig.ft.com/sites/elections/2016/uk/eu-referendum/';

  const _tabs = Array.isArray(config.tabs) ? config.tabs : typeof config.tabs === 'string' ? config.tabs.trim().replace(/\,/, '').split(/\s+/) : [];
  config.tabs = _tabs.map(d => {
    return typeof d === 'string' ? d.toLowerCase().trim() : null;
  });

  console.log('Tabs enabled:', config.tabs.join(' '));
  console.log('Ticker type:', config.ticker);

  const str = await nunjucks.render(path.resolve(__dirname, '../../next-template.json'), config);
  let valid_json;

  try {
    valid_json = JSON.stringify(JSON.parse(str));
  } catch (e) {
    throw e;
  }

  const d = await fs.writeFileAsync(path.resolve(output_dir, './next.json'), valid_json, {encoding: 'utf-8'});
  return d;
}
