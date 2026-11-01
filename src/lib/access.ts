import 'server-only';
import { cookies, headers } from 'next/headers';
import type { NextResponse } from 'next/server';
import { features } from '@/config';
import { ACCESS_MAX_AGE_S, issueAccessToken, verifyAccessToken } from '@/lib/access-token';
import { isDevelopment } from '@/lib/env';
import { ACCESS_COOKIE_NAME } from '@/lib/storage-keys';
import { getTurnstileSecretKey } from '@/lib/turnstile';

// The __Host- prefix makes browsers require Secure + Path=/ and reject a Domain, so a sibling subdomain cannot overwrite
// the cookie. It needs HTTPS, which plain-http dev servers lack.
const ACCESS_COOKIE = isDevelopment ? ACCESS_COOKIE_NAME : `__Host-${ACCESS_COOKIE_NAME}`;
const MIN_SECRET_LENGTH = 32;

/** ACCESS_COOKIE_SECRET when set; otherwise a key derived from the Turnstile secret, so existing installs keep working. */
function getSigningKey(): string | undefined {
  const dedicated = process.env.ACCESS_COOKIE_SECRET;
  if (dedicated && dedicated.length >= MIN_SECRET_LENGTH) return `access-cookie:${dedicated}`;
  if (dedicated) console.warn(`[ACCESS] ACCESS_COOKIE_SECRET is shorter than ${MIN_SECRET_LENGTH} characters and was ignored`);

  const turnstile = getTurnstileSecretKey();
  return turnstile ? `access-cookie:${turnstile}` : undefined;
}

/** Marks the visitor as verified for 24h with a signed, HttpOnly cookie. Returns false if no secret is configured. */
export function grantAccess(request: Request, response: NextResponse): boolean {
  const key = getSigningKey();
  if (!key) return false;

  response.cookies.set(ACCESS_COOKIE, issueAccessToken(key, request.headers.get('user-agent')), {
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

  return verifyAccessToken(key, value, (await headers()).get('user-agent'));
}
