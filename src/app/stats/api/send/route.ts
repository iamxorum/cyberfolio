import { siteConfig } from '@/config';
import { analyticsUpstream, isBotUserAgent } from '@/lib/analytics';
import { isAllowedOrigin } from '@/lib/origin';
import { devOrigins } from '@/lib/env';
import { getClientKey, isRateLimited } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 16 * 1024;
const MAX_CACHE_TOKEN = 2048;
const TIMEOUT_MS = 5000;
const RATE_LIMIT = 120;
const RATE_WINDOW_MS = 60_000;

const reply = (status: number, error?: string) =>
  new Response(error ? JSON.stringify({ error }) : null, { status, headers: { 'Content-Type': 'application/json' } });

// Relays tracker events to Umami. Only this path is exposed, with limits.
export async function POST(request: Request) {
  const upstream = analyticsUpstream();
  if (!upstream) return reply(404);

  // Answered like a success so a bot has nothing to retry against.
  if (isBotUserAgent(request.headers.get('user-agent'))) return reply(204);

  if (!isAllowedOrigin(request, siteConfig.domain, devOrigins)) return reply(403, 'Invalid origin');

  const clientIp = getClientKey(request);
  if (isRateLimited(`stats:${clientIp}`, RATE_LIMIT, RATE_WINDOW_MS)) return reply(429, 'Too many requests');

  if (Number(request.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return reply(413, 'Payload too large');
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return reply(413, 'Payload too large');

  // Forward only what Umami needs. Never cookies or auth headers.
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const forward = (name: string, value: string | null, maxLength = Infinity) => {
    if (value && value.length <= maxLength) headers[name] = value;
  };
  forward('User-Agent', request.headers.get('user-agent'));
  forward('Accept-Language', request.headers.get('accept-language'));
  forward('X-Umami-Cache', request.headers.get('x-umami-cache'), MAX_CACHE_TOKEN);
  if (clientIp !== 'unknown') headers['X-Forwarded-For'] = clientIp;

  try {
    const res = await fetch(`${upstream}/api/send`, { method: 'POST', headers, body, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) {
      console.warn('[ANALYTICS] Umami rejected an event:', res.status);
      return reply(res.status >= 500 ? 502 : 400, 'Event rejected');
    }
    return new Response(await res.text(), { status: res.status, headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' } });
  } catch (error) {
    console.error('[ANALYTICS] Umami unreachable:', error instanceof Error ? error.message : error);
    return reply(502, 'Analytics unavailable');
  }
}
