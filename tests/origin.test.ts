import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isAllowedOrigin } from '../src/lib/origin.ts';

const request = (headers: Record<string, string>) => new Request('https://example.com/api', { headers });
const allowed = (headers: Record<string, string>, extra: string[] = []) => isAllowedOrigin(request(headers), 'example.com', extra);

test('accepts the site and its www host', () => {
  assert.equal(allowed({ origin: 'https://example.com' }), true);
  assert.equal(allowed({ origin: 'https://www.example.com' }), true);
});

test('falls back to the referer when there is no origin', () => {
  assert.equal(allowed({ referer: 'https://example.com/cv?x=1' }), true);
});

test('rejects other hosts, other schemes and lookalikes', () => {
  assert.equal(allowed({ origin: 'https://evil.com' }), false);
  assert.equal(allowed({ origin: 'http://example.com' }), false);
  assert.equal(allowed({ origin: 'https://example.com.evil.com' }), false);
  assert.equal(allowed({ origin: 'https://evilexample.com' }), false);
});

test('rejects a request with neither header, or an unparsable one', () => {
  assert.equal(allowed({}), false);
  assert.equal(allowed({ origin: 'not a url' }), false);
});

test('accepts the extra origins it is given', () => {
  assert.equal(allowed({ origin: 'http://localhost:3000' }, ['http://localhost:3000']), true);
  assert.equal(allowed({ origin: 'http://localhost:3000' }), false);
});
