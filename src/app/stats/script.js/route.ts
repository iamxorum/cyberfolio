import { analyticsUpstream } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const CACHE_MS = 60 * 60 * 1000;
const UPSTREAM_TIMEOUT_MS = 5000;

// The tracker rarely changes, so it is fetched from Umami at most once an hour and a stale copy is kept
// for the case where Umami is briefly unreachable.
let cached: { body: string; fetchedAt: number } | null = null;

const respond = (body: string) =>
  new Response(body, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });

export async function GET() {
  const upstream = analyticsUpstream();
  if (!upstream) return new Response('Not found', { status: 404 });

  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) return respond(cached.body);

  try {
    const res = await fetch(`${upstream}/script.js`, { signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    cached = { body: await res.text(), fetchedAt: Date.now() };
    return respond(cached.body);
  } catch (error) {
    console.error('[ANALYTICS] could not fetch tracker script:', error instanceof Error ? error.message : error);
    return cached ? respond(cached.body) : new Response('Unavailable', { status: 502 });
  }
}
