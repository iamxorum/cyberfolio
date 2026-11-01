// Generates CHANGELOG.md from src/lib/changelog.ts.
//   npm run changelog            write CHANGELOG.md
//   npm run changelog -- --check exit 1 if CHANGELOG.md is out of date (used in CI)
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { readReleases } from './changelog-data.mjs';

const FILE = 'CHANGELOG.md';

const header = `# Changelog

Generated from \`src/lib/changelog.ts\` by \`npm run changelog\`. Do not edit by hand.
`;

const sections = readReleases().map(({ version, date, changes }) => {
  const title = version === 'Unreleased' ? 'Unreleased' : `${version} (${date})`;
  return `## ${title}\n\n${changes.map((line) => `- ${line}`).join('\n')}\n`;
});

const output = `${header}\n${sections.join('\n')}`;

if (process.argv.includes('--check')) {
  const current = existsSync(FILE) ? readFileSync(FILE, 'utf8') : '';
  if (current !== output) {
    console.error(`${FILE} is out of date. Run \`npm run changelog\` and commit the result.`);
    process.exit(1);
  }
  console.log(`${FILE} is up to date.`);
} else {
  writeFileSync(FILE, output);
  console.log(`Wrote ${FILE} (${sections.length} releases).`);
}
