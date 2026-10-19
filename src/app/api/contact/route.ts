import { NextResponse } from 'next/server';
import { siteConfig } from '@/config';
import { hasAccess } from '@/lib/access';
import { contactEmail, contactPhone } from '@/lib/contact';
import { devOrigins } from '@/lib/env';
import { isAllowedOrigin } from '@/lib/origin';
import { getClientKey, isRateLimited } from '@/lib/rate-limit';

const reply = (body: object, status: number) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

// Hands out the contact details, but only to a visitor who passed Turnstile.
export async function GET(request: Request) {
  if (!isAllowedOrigin(request, siteConfig.domain, devOrigins)) {
    return reply({ error: 'Invalid origin' }, 403);
  }
  if (isRateLimited(`contact:${getClientKey(request)}`, 30, 60_000)) return reply({ error: 'Too many requests' }, 429);
  if (!(await hasAccess())) return reply({ error: 'Verification required' }, 401);

  const email = contactEmail();
  const phone = contactPhone();
  return email || phone ? reply({ email, phone }, 200) : reply({ error: 'Contact is not configured' }, 503);
}
