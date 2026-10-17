import { isIP } from 'node:net';

const MAX_BUCKETS = 10_000;
const buckets = new Map<string, { count: number; resetAt: number }>();
let checksSinceSweep = 0;

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  checksSinceSweep += 1;
  if (checksSinceSweep >= 1000) {
    checksSinceSweep = 0;
    for (const [bucketKey, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(bucketKey);
    }
  }

  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    // A flood of distinct keys must not grow memory without bound: evict the oldest entry first.
    if (!bucket && buckets.size >= MAX_BUCKETS) {
      const oldest = buckets.keys().next().value;
      if (oldest !== undefined) buckets.delete(oldest);
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

const asIp = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed && isIP(trimmed) ? trimmed : null;
};

/**
 * Identifies the caller for rate limiting. Proxy headers are only as trustworthy as the network in front of
 * the app, so how much to believe them is set with RATE_LIMIT_PROXY:
 *   cloudflare  - the app is reachable only through Cloudflare: use cf-connecting-ip and nothing else.
 *   forwarded   - use the entry the last trusted proxy appended to x-forwarded-for (RATE_LIMIT_PROXY_HOPS
 *                 proxies deep, default 1); anything a client prepended is ignored.
 *   (unset)     - legacy behaviour: first header found wins. Spoofable if the app is reachable directly.
 * Every value must be a real IP address, so arbitrary strings can't be used as keys.
 */
export function getClientKey(request: Request): string {
  const mode = process.env.RATE_LIMIT_PROXY;

  if (mode === 'cloudflare') {
    return asIp(request.headers.get('cf-connecting-ip')) ?? 'unknown';
  }

  if (mode === 'forwarded') {
    const hops = Math.max(1, Number.parseInt(process.env.RATE_LIMIT_PROXY_HOPS ?? '1', 10) || 1);
    const chain = (request.headers.get('x-forwarded-for') ?? '').split(',');
    return asIp(chain[chain.length - hops]) ?? 'unknown';
  }

  return (
    asIp(request.headers.get('cf-connecting-ip')) ??
    asIp(request.headers.get('x-forwarded-for')?.split(',')[0]) ??
    asIp(request.headers.get('x-real-ip')) ??
    'unknown'
  );
}
