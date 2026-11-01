import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const ACCESS_MAX_AGE_S = 24 * 60 * 60;
// Bump to invalidate every token issued under an older payload format.
const ACCESS_VERSION = 'v1';

const sign = (payload: string, key: string) => createHmac('sha256', key).update(payload).digest('hex');

// Binds the token to the browser it was issued to: a copy replayed from another client fails the check.
// The IP is left out on purpose, as mobile visitors change it constantly.
const clientFingerprint = (userAgent: string | null) =>
  createHash('sha256').update(userAgent ?? '').digest('hex').slice(0, 16);

/** `version.expires.fingerprint.signature`, valid for 24h from `now`. */
export function issueAccessToken(key: string, userAgent: string | null, now = Date.now()): string {
  const payload = [ACCESS_VERSION, now + ACCESS_MAX_AGE_S * 1000, clientFingerprint(userAgent)].join('.');
  return `${payload}.${sign(payload, key)}`;
}

/** True for an unexpired token signed with `key` and issued to the same user agent. */
export function verifyAccessToken(key: string, token: string, userAgent: string | null, now = Date.now()): boolean {
  const [version, expires, fingerprint, signature = ''] = token.split('.');
  if (version !== ACCESS_VERSION || !fingerprint) return false;
  if (!(Number(expires) > now)) return false;

  const expected = Buffer.from(sign(`${version}.${expires}.${fingerprint}`, key));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;

  return fingerprint === clientFingerprint(userAgent);
}
