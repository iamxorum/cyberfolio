import 'server-only';
import { analyticsConfig } from '@/config';
import { analyticsUpstream } from '@/lib/analytics';

/** Counts below this are left out: "2 views" reads as an empty room. */
const MIN_VIEWS_SHOWN = 10;

const CACHE_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 5000;

let token: string | null = null;
let cache: { views: Map<string, number>; fetchedAt: number } | null = null;
let warned = false;

const warnOnce = (message: string) => {
  if (warned) return;
  warned = true;
  console.error(`[ANALYTICS] ${message}`);
};

async function login(upstream: string, username: string, password: string): Promise<string> {
  const res = await fetch(`${upstream}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`Umami login answered ${res.status}`);
  return (await res.json()).token;
}

// Umami renamed the `url` metric to `path` in v2.x, so ask for the new name first.
async function fetchMetrics(upstream: string, bearer: string, type: 'path' | 'url'): Promise<Response> {
  const query = new URLSearchParams({ type, startAt: '0', endAt: String(Date.now()), limit: '500' });
  return fetch(`${upstream}/api/websites/${analyticsConfig.websiteId}/metrics?${query}`, {
    headers: { Authorization: `Bearer ${bearer}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}

async function loadViews(upstream: string, username: string, password: string): Promise<Map<string, number>> {
  token ??= await login(upstream, username, password);

  let res = await fetchMetrics(upstream, token, 'path');
  if (res.status === 401) {
    token = await login(upstream, username, password);
    res = await fetchMetrics(upstream, token, 'path');
  }
  if (res.status === 400) res = await fetchMetrics(upstream, token, 'url');
  if (!res.ok) throw new Error(`Umami metrics answered ${res.status}`);

  const rows: { x: string; y: number }[] = await res.json();
  return new Map(rows.map((row) => [row.x, row.y]));
}

/**
 * Page views per path, from the Umami instance. Needs a (view-only) Umami login in UMAMI_API_USER and
 * UMAMI_API_PASSWORD; without it, or when Umami is down, this is empty and the site simply shows no counts.
 */
async function getPageViews(): Promise<Map<string, number>> {
  const upstream = analyticsUpstream();
  const username = process.env.UMAMI_API_USER?.trim();
  const password = process.env.UMAMI_API_PASSWORD;
  if (!upstream || !analyticsConfig.websiteId || !username || !password) return new Map();

  if (cache && Date.now() - cache.fetchedAt < CACHE_MS) return cache.views;

  try {
    cache = { views: await loadViews(upstream, username, password), fetchedAt: Date.now() };
  } catch (error) {
    token = null;
    warnOnce(`could not read page views: ${error instanceof Error ? error.message : error}`);
    // Keep serving the last good numbers, and wait a full interval before asking a struggling Umami again.
    cache = { views: cache?.views ?? new Map(), fetchedAt: Date.now() };
  }
  return cache.views;
}

/** View counts for blog posts, keyed by slug, with the quiet ones left out. */
export async function getPostViews(): Promise<Record<string, number>> {
  const views: Record<string, number> = {};
  for (const [path, count] of await getPageViews()) {
    const slug = path.match(/^\/blog\/([^/]+)\/?$/)?.[1];
    if (slug && count >= MIN_VIEWS_SHOWN) views[slug] = count;
  }
  return views;
}
