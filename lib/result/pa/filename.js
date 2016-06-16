import path from 'path';
import MessageType from './message-type';

export default function parse_filename(filename) {
  const p = path.parse(filename);
  const parts = p.name.split(/_/g);
  const last_part = parts[parts.length - 1];
  const o = {filename: filename};
  o.is_eu_ref = parts[0] === 'EU';
  o.is_running_totals = o.is_eu_ref && parts[1] === 'running' && parts[2] === 'totals';
  o.is_voting_area = o.is_eu_ref && !o.is_running_totals;
  o.type = (o.is_voting_area && MessageType[parts[1].toUpperCase()]) || null;
  o.revision = /^\d+$/.test(last_part) ? parseInt(last_part) : null;
  o.name = o.is_voting_area ? parts.slice(2, parts.length - 1).join(' ') : null;
  return o;
}
