import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const notes = (version: string) => spawnSync(process.execPath, ['scripts/release.mjs', '--notes', version], { encoding: 'utf8' });

test('prints a release as a Markdown list', () => {
  const result = notes('1.7.2');
  assert.equal(result.status, 0);
  const lines = result.stdout.trim().split('\n');
  assert.ok(lines.length >= 2);
  assert.ok(lines.every((line) => line.startsWith('- ')));
});

test('fails for a version with no changelog entry', () => {
  const result = notes('9.9.9');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /No entry for 9\.9\.9/);
});

test('rejects input that is not a version', () => {
  const result = spawnSync(process.execPath, ['scripts/release.mjs', '--notes', 'latest'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
});
