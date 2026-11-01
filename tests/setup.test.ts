import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

const SCRIPT = resolve('scripts/setup.mjs');
const SAMPLES = ['config.example', 'content.example', '.env.example', 'public/data/banned_ips.example.json'];

function project() {
  const dir = mkdtempSync(join(tmpdir(), 'setup-'));
  for (const sample of SAMPLES) {
    const target = join(dir, sample);
    mkdirSync(join(target, '..'), { recursive: true });
    cpSync(resolve(sample), target, { recursive: true });
  }
  return dir;
}

const run = (cwd: string) => spawnSync(process.execPath, [SCRIPT], { cwd, encoding: 'utf8' });

test('copies every example into place', () => {
  const dir = project();
  try {
    const result = run(dir);
    assert.equal(result.status, 0, result.stderr);
    assert.ok(existsSync(join(dir, 'src/config/site.config.ts')));
    assert.ok(existsSync(join(dir, 'content/blog')));
    assert.ok(existsSync(join(dir, '.env')));
    assert.ok(existsSync(join(dir, 'public/data/banned_ips.json')));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('never overwrites what already exists', () => {
  const dir = project();
  try {
    writeFileSync(join(dir, '.env'), 'MINE=1\n');
    const result = run(dir);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(join(dir, '.env'), 'utf8'), 'MINE=1\n');
    assert.match(result.stdout, /skip\s+\.env/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('fails outside the project root', () => {
  const dir = mkdtempSync(join(tmpdir(), 'setup-empty-'));
  try {
    assert.equal(run(dir).status, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the sample threat feed matches the shape the globe reads', () => {
  const feed = JSON.parse(readFileSync('public/data/banned_ips.example.json', 'utf8'));
  assert.equal(typeof feed.last_updated, 'string');
  assert.equal(feed.total_banned, feed.recent_bans.length);
  for (const ban of feed.recent_bans) {
    assert.ok(['local', 'public'].includes(ban.source));
    assert.equal(typeof ban.country, 'string');
    assert.equal(typeof ban.lat, 'number');
    assert.equal(typeof ban.lng, 'number');
    assert.match(ban.ip, /\.xxx$/);
  }
});
