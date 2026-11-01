// Reads the releases out of src/lib/changelog.ts, the single source for release notes.
// Handles both layouts used there: one entry per line, and a multi-line `changes` array.
import { readFileSync } from 'node:fs';

const SOURCE = 'src/lib/changelog.ts';
const HEAD = /version: '([^']+)',\s*date: '([^']+)',\s*changes: \[/g;
const ITEM = /\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")\s*,?/y;

/** Every release, newest first: `{ version, date, changes }`. */
export function readReleases() {
  const source = readFileSync(SOURCE, 'utf8');
  const releases = [];

  for (const head of source.matchAll(HEAD)) {
    const changes = [];
    ITEM.lastIndex = head.index + head[0].length;
    for (let item = ITEM.exec(source); item; item = ITEM.exec(source)) {
      changes.push((item[1] ?? item[2]).replace(/\\(['"])/g, '$1'));
    }
    releases.push({ version: head[1], date: head[2], changes });
  }

  return releases;
}
