import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ACCESS_MAX_AGE_S, issueAccessToken, verifyAccessToken } from '../src/lib/access-token.ts';

const KEY = 'access-cookie:test-secret';
const UA = 'Mozilla/5.0 (test)';
const NOW = 1_700_000_000_000;

test('accepts a fresh token for the same browser', () => {
  const token = issueAccessToken(KEY, UA, NOW);
  assert.equal(verifyAccessToken(KEY, token, UA, NOW + 1000), true);
});

test('rejects a token after 24 hours', () => {
  const token = issueAccessToken(KEY, UA, NOW);
  assert.equal(verifyAccessToken(KEY, token, UA, NOW + ACCESS_MAX_AGE_S * 1000 - 1), true);
  assert.equal(verifyAccessToken(KEY, token, UA, NOW + ACCESS_MAX_AGE_S * 1000 + 1), false);
});

test('rejects a token replayed from another browser', () => {
  const token = issueAccessToken(KEY, UA, NOW);
  assert.equal(verifyAccessToken(KEY, token, 'curl/8.0', NOW), false);
  assert.equal(verifyAccessToken(KEY, token, null, NOW), false);
});

test('rejects a token signed with another key', () => {
  const token = issueAccessToken('access-cookie:other', UA, NOW);
  assert.equal(verifyAccessToken(KEY, token, UA, NOW), false);
});

test('rejects a token with an extended expiry', () => {
  const [version, expires, fingerprint, signature] = issueAccessToken(KEY, UA, NOW).split('.');
  const forged = [version, Number(expires) + 86_400_000, fingerprint, signature].join('.');
  assert.equal(verifyAccessToken(KEY, forged, UA, NOW), false);
});

test('rejects malformed and empty tokens', () => {
  for (const token of ['', 'v1', 'v1.1.2', 'v2.9999999999999.abc.def', 'a.b.c.d.e']) {
    assert.equal(verifyAccessToken(KEY, token, UA, NOW), false, token);
  }
});

test('rejects a truncated signature', () => {
  const token = issueAccessToken(KEY, UA, NOW);
  assert.equal(verifyAccessToken(KEY, token.slice(0, -4), UA, NOW), false);
});
