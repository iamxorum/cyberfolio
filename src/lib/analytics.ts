import { features } from '@/config';

export const ANALYTICS_PATH = '/stats';

let warned = false;
const warnOnce = (message: string) => {
  if (warned) return;
  warned = true;
  console.error(`[ANALYTICS] ${message}`);
};

// Umami address. Server-side only, never sent to the browser.
// Returns null when analytics is off or misconfigured (logged once).
// "host:port" without http:// is accepted.
export function analyticsUpstream(): string | null {
  if (!features.analytics) return null;

  const raw = process.env.ANALYTICS_UPSTREAM?.trim();
  if (!raw) {
    warnOnce('ANALYTICS_UPSTREAM is not set. /stats/* returns 404.');
    return null;
  }

  const candidate = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `http://${raw}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('not http(s)');
    return url.origin;
  } catch {
    warnOnce(`ANALYTICS_UPSTREAM "${raw}" is not usable. Example: http://umami:3000`);
    return null;
  }
}
