import path from 'path';
import fs from 'fs';
import bluebird from 'bluebird';
import d3 from 'd3';

bluebird.promisifyAll(fs);

export async function regions() {
  return await read_csv(path.resolve(__dirname, '../../data/ons/regions.csv'))
}

export async function voting_areas() {
  return await read_csv(path.resolve(__dirname, '../../data/ft/lookup.csv'));
}

export async function voting_area_age() {
  const raw = await read_csv(path.resolve(__dirname, '../../data/ft/populations.csv'));
  return raw.map(row => {
    return {
      ons_id: row.code,
      age_18_24: row['Aged 18 to 24'] ? parseInt(row['Aged 18 to 24']) : null,
      age_25_49: row['Aged 25 to 49'] ? parseInt(row['Aged 25 to 49']) : null,
      age_50_64: row['Aged 50 to 64'] ? parseInt(row['Aged 50 to 64']) : null,
      age_65_up: row['Aged 65+'] ? parseInt(row['Aged 65+']) : null,
    }
  });
}

export async function voting_area_population() {
  const raw = await read_csv(path.resolve(__dirname, '../../data/ons/2014-population_estimates_for_local_authorities_UK.csv'));
  return raw.map(row => {
    return {
      ons_id: row.Code,
      est_pop_2013: row['Estimated Population mid-2013'] ? parseInt(row['Estimated Population mid-2013']) : null,
      births: row['Births'] ? parseInt(row['Births']) : null,
      deaths: row['Deaths'] ? parseInt(row['Deaths']) : null,
      births_minus_deaths: row['Births minus Deaths'] ? parseInt(row['Births minus Deaths']) : null,
      uk_migration_in: row['Internal Migration Inflow'] ? parseInt(row['Internal Migration Inflow']) : null,
      uk_migration_out: row['Internal Migration Outflow'] ? parseInt(row['Internal Migration Outflow']) : null,
      uk_migration_net: row['Internal Migration Net'] ? parseInt(row['Internal Migration Net']) : null,
      intl_migration_in: row['International Migration Inflow'] ? parseInt(row['International Migration Inflow']) : null,
      intl_migration_out: row['International Migration Outflow'] ? parseInt(row['International Migration Outflow']) : null,
      intl_migration_net: row['International Migration Net'] ? parseInt(row['International Migration Net']) : null,
    };
  });
}

async function read_csv(file) {
  return d3.csv.parse(await fs.readFileAsync(file, 'utf-8'));
}
