const buckets = new Map<string, { count: number; resetAt: number }>();
let checksSinceSweep = 0;

/**
 * Simple in-memory fixed-window rate limiter. Good enough for a single-instance
 * personal-site deployment; state is per-process and resets on restart/redeploy.
 */
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
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  return request.headers.get('x-real-ip') || 'unknown';
}
