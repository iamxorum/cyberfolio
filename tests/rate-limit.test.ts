import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { getClientKey, isRateLimited } from '../src/lib/rate-limit.ts';

const request = (headers: Record<string, string>) => new Request('https://example.com', { headers });

afterEach(() => {
  delete process.env.RATE_LIMIT_PROXY;
  delete process.env.RATE_LIMIT_PROXY_HOPS;
});

test('allows up to the limit, then blocks', () => {
  const key = `limit-${Math.random()}`;
  const results = Array.from({ length: 5 }, () => isRateLimited(key, 3, 60_000));
  assert.deepEqual(results, [false, false, false, true, true]);
});

test('counts each key separately', () => {
  const a = `a-${Math.random()}`;
  const b = `b-${Math.random()}`;
  assert.equal(isRateLimited(a, 1, 60_000), false);
  assert.equal(isRateLimited(a, 1, 60_000), true);
  assert.equal(isRateLimited(b, 1, 60_000), false);
});

test('starts a fresh window once the old one has passed', async () => {
  const key = `window-${Math.random()}`;
  assert.equal(isRateLimited(key, 1, 20), false);
  assert.equal(isRateLimited(key, 1, 20), true);
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(isRateLimited(key, 1, 20), false);
});

test('cloudflare mode trusts only cf-connecting-ip', () => {
  process.env.RATE_LIMIT_PROXY = 'cloudflare';
  assert.equal(getClientKey(request({ 'cf-connecting-ip': '203.0.113.5', 'x-forwarded-for': '198.51.100.9' })), '203.0.113.5');
  assert.equal(getClientKey(request({ 'x-forwarded-for': '198.51.100.9' })), 'unknown');
});

test('forwarded mode ignores what the client prepended', () => {
  process.env.RATE_LIMIT_PROXY = 'forwarded';
  assert.equal(getClientKey(request({ 'x-forwarded-for': '6.6.6.6, 203.0.113.5' })), '203.0.113.5');
  process.env.RATE_LIMIT_PROXY_HOPS = '2';
  assert.equal(getClientKey(request({ 'x-forwarded-for': '6.6.6.6, 203.0.113.5, 10.0.0.1' })), '203.0.113.5');
});

test('rejects values that are not IP addresses', () => {
  process.env.RATE_LIMIT_PROXY = 'cloudflare';
  assert.equal(getClientKey(request({ 'cf-connecting-ip': '<script>' })), 'unknown');
});
