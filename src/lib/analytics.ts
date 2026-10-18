import { features } from '@/config';

/** Same-origin path the tracker script and collector are served under (matches the app/stats routes). */
export const ANALYTICS_PATH = '/stats';

/**
 * Internal address of the Umami server, e.g. http://10.80.0.30:3000. Read from the environment at request
 * time and used only on the server, so the internal address never reaches the browser. Null when analytics is
 * off or the variable is missing or not an http(s) URL.
 */
export function analyticsUpstream(): string | null {
  if (!features.analytics) return null;
  const raw = process.env.ANALYTICS_UPSTREAM?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.origin;
  } catch {
    return null;
  }
}
