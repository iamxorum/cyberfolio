import { siteConfig } from '@/config';
import { analyticsUpstream } from '@/lib/analytics';
import { isAllowedOrigin } from '@/lib/origin';
import { getClientKey, isRateLimited } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const isDevelopment = process.env.NODE_ENV === 'development';

// Umami events are small JSON documents; anything bigger is not a page view.
const MAX_BODY_BYTES = 16 * 1024;
const UPSTREAM_TIMEOUT_MS = 5000;
const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60_000;

const reply = (status: number, error?: string) =>
  new Response(error ? JSON.stringify({ error }) : null, { status, headers: { 'Content-Type': 'application/json' } });

/**
 * First-party collector: the tracker posts here and the site relays the event to Umami over the internal network.
 * Only this one path of Umami is reachable from outside, and only with the limits below.
 */
export async function POST(request: Request) {
  const upstream = analyticsUpstream();
  if (!upstream) return reply(404);

  if (!isAllowedOrigin(request, siteConfig.domain, isDevelopment ? ['http://localhost:3000', 'http://localhost:3001'] : [])) {
    return reply(403, 'Invalid origin');
  }

  const clientIp = getClientKey(request);
  if (isRateLimited(`stats:${clientIp}`, RATE_LIMIT, RATE_WINDOW_MS)) return reply(429, 'Too many requests');

  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return reply(413, 'Payload too large');

  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return reply(413, 'Payload too large');

  // Only what Umami needs to classify the visit is forwarded. Cookies and auth headers are never passed on.
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const userAgent = request.headers.get('user-agent');
  if (userAgent) headers['User-Agent'] = userAgent;
  const language = request.headers.get('accept-language');
  if (language) headers['Accept-Language'] = language;
  if (clientIp !== 'unknown') headers['X-Forwarded-For'] = clientIp;

  try {
    const res = await fetch(`${upstream}/api/send`, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
    });
    if (!res.ok) {
      // Umami's own error text is for the operator's log, not for whoever sent the event.
      console.warn('[ANALYTICS] Umami rejected an event:', res.status);
      return reply(res.status >= 500 ? 502 : 400, 'Event rejected');
    }
    return new Response(await res.text(), { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' } });
  } catch (error) {
    console.error('[ANALYTICS] could not reach Umami:', error instanceof Error ? error.message : error);
    return reply(502, 'Analytics unavailable');
  }
}
