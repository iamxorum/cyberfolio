import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import type { NextResponse } from 'next/server';
import { features } from '@/config';
import { isDevelopment } from '@/lib/env';
import { getTurnstileSecretKey } from '@/lib/turnstile';

// The __Host- prefix makes browsers require Secure + Path=/ and reject a Domain, so a sibling subdomain cannot overwrite
// the cookie. It needs HTTPS, which plain-http dev servers lack.
const ACCESS_COOKIE = isDevelopment ? 'iamxorum_access' : '__Host-iamxorum_access';
const ACCESS_MAX_AGE_S = 24 * 60 * 60;
// Bump to invalidate every cookie issued under an older payload format.
const ACCESS_VERSION = 'v1';
const MIN_SECRET_LENGTH = 32;

/** ACCESS_COOKIE_SECRET when set; otherwise a key derived from the Turnstile secret, so existing installs keep working. */
function getSigningKey(): string | undefined {
  const dedicated = process.env.ACCESS_COOKIE_SECRET;
  if (dedicated && dedicated.length >= MIN_SECRET_LENGTH) return `access-cookie:${dedicated}`;
  if (dedicated) console.warn(`[ACCESS] ACCESS_COOKIE_SECRET is shorter than ${MIN_SECRET_LENGTH} characters and was ignored`);

  const turnstile = getTurnstileSecretKey();
  return turnstile ? `access-cookie:${turnstile}` : undefined;
}

const sign = (payload: string, key: string) => createHmac('sha256', key).update(payload).digest('hex');

// Binds the cookie to the browser it was issued to: a copy replayed from another client fails the check.
// The IP is left out on purpose, as mobile visitors change it constantly.
const clientFingerprint = (userAgent: string | null) =>
  createHash('sha256').update(userAgent ?? '').digest('hex').slice(0, 16);

/** Marks the visitor as verified for 24h with a signed, HttpOnly cookie. Returns false if no secret is configured. */
export function grantAccess(request: Request, response: NextResponse): boolean {
  const key = getSigningKey();
  if (!key) return false;

  const payload = [ACCESS_VERSION, Date.now() + ACCESS_MAX_AGE_S * 1000, clientFingerprint(request.headers.get('user-agent'))].join('.');
  response.cookies.set(ACCESS_COOKIE, `${payload}.${sign(payload, key)}`, {
    httpOnly: true,
    secure: !isDevelopment,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_MAX_AGE_S,
  });
  return true;
}

/** Whether the visitor passed Turnstile. Always true when the Turnstile feature is off. */
export async function hasAccess(): Promise<boolean> {
  if (!features.turnstile) return true;

  const key = getSigningKey();
  const value = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!key || !value) return false;

  const [version, expires, fingerprint, signature = ''] = value.split('.');
  if (version !== ACCESS_VERSION || !fingerprint) return false;
  if (!(Number(expires) > Date.now())) return false;

  const expected = Buffer.from(sign(`${version}.${expires}.${fingerprint}`, key));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;

  const current = clientFingerprint((await headers()).get('user-agent'));
  return fingerprint === current;
}
