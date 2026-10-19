import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import type { NextResponse } from 'next/server';
import { features } from '@/config';
import { isDevelopment } from '@/lib/env';
import { getTurnstileSecretKey } from '@/lib/turnstile';

const ACCESS_COOKIE = 'iamxorum_access';
const ACCESS_MAX_AGE_S = 24 * 60 * 60;

// Signed with a key derived from the Turnstile secret, so no extra secret has to be configured.
const sign = (payload: string, secret: string) =>
  createHmac('sha256', `access-cookie:${secret}`).update(payload).digest('hex');

/** Marks the visitor as verified for 24h with a signed, HttpOnly cookie. Returns false if no secret is configured. */
export function grantAccess(response: NextResponse): boolean {
  const secret = getTurnstileSecretKey();
  if (!secret) return false;

  const expires = String(Date.now() + ACCESS_MAX_AGE_S * 1000);
  response.cookies.set(ACCESS_COOKIE, `${expires}.${sign(expires, secret)}`, {
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

  const secret = getTurnstileSecretKey();
  const value = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!secret || !value) return false;

  const [expires, signature = ''] = value.split('.');
  if (!(Number(expires) > Date.now())) return false;

  const expected = Buffer.from(sign(expires, secret));
  const given = Buffer.from(signature);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
