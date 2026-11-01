// Release helper. The changelog entry in src/lib/changelog.ts is the single source of release notes.
//   npm run release -- 1.7.4          bump package.json, the lockfile and systemVersion in the site configs
//   npm run release -- --notes 1.7.4  print that version's changelog entry as Markdown (used by the release workflow)
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const CHANGELOG = 'src/lib/changelog.ts';
const SITE_CONFIGS = ['config.example/site.config.ts', 'src/config/site.config.ts'];

const args = process.argv.slice(2);
const notesMode = args.includes('--notes');
const version = args.find((arg) => /^\d+\.\d+\.\d+$/.test(arg));

if (!version) {
  console.error('Usage: npm run release -- [--notes] <major.minor.patch>');
  process.exit(1);
}

/** Returns the `changes` strings of one release, or null when the changelog has no entry for it. */
function changesFor(source, wanted) {
  const start = source.indexOf(`version: '${wanted}'`);
  if (start === -1) return null;
  const open = source.indexOf('changes: [', start);
  const close = source.indexOf('\n    ],', open);
  const block = source.slice(open, close);
  return [...block.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map((m) => m[1].replace(/\\'/g, "'"));
}

const changes = changesFor(readFileSync(CHANGELOG, 'utf8'), version);
if (!changes?.length) {
  console.error(`No entry for ${version} in ${CHANGELOG}. Add it first.`);
  process.exit(1);
}

if (notesMode) {
  console.log(changes.map((line) => `- ${line}`).join('\n'));
  process.exit(0);
}

execFileSync('npm', ['version', version, '--no-git-tag-version'], { stdio: 'inherit' });

for (const file of SITE_CONFIGS.filter(existsSync)) {
  const source = readFileSync(file, 'utf8');
  writeFileSync(file, source.replace(/systemVersion: 'v[^']*'/, `systemVersion: 'v${version}'`));
}

console.log(`\nBumped to ${version}. Next:`);
console.log(`  git commit -am "v${version}: bump version and changelog"`);
console.log(`  git tag v${version} && git push origin main v${version}`);
