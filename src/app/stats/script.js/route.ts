import { analyticsUpstream } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const CACHE_MS = 60 * 60 * 1000;
const TIMEOUT_MS = 5000;

// Kept for an hour. A stale copy covers short Umami outages.
let cached: { body: string; fetchedAt: number } | null = null;

// Errors are served as JS too, so the console shows the real status.
const script = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': status === 200 ? 'public, max-age=3600' : 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });

export async function GET() {
  const upstream = analyticsUpstream();
  if (!upstream) return script('// analytics off', 404);

  if (cached && Date.now() - cached.fetchedAt < CACHE_MS) return script(cached.body);

  try {
    const res = await fetch(`${upstream}/script.js`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`Umami answered ${res.status}`);
    cached = { body: await res.text(), fetchedAt: Date.now() };
    return script(cached.body);
  } catch (error) {
    console.error('[ANALYTICS] tracker script fetch failed:', error instanceof Error ? error.message : error);
    return cached ? script(cached.body) : script('// analytics unavailable', 502);
  }
}
