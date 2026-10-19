import { NextResponse } from 'next/server';
import { features, siteConfig } from '@/config';
import { isRateLimited, getClientKey } from '@/lib/rate-limit';
import { getTurnstileSecretKey } from '@/lib/turnstile';
import { isAllowedOrigin } from '@/lib/origin';
import { grantAccess } from '@/lib/access';
import { devOrigins, isDevelopment } from '@/lib/env';
import { notFoundResponse } from '@/lib/http';

// Turnstile tokens are at most 2048 characters (Cloudflare's documented limit).
const MAX_TOKEN_LENGTH = 2048;
const SITEVERIFY_TIMEOUT_MS = 5000;

// Hostnames a genuine token can be issued for: this site, plus the alternate domains that redirect to it.
const allowedHostnames = new Set(
    [siteConfig.domain, ...(siteConfig.alternateDomains ?? [])].flatMap((domain) => [domain, `www.${domain}`])
);

const fail = (error: string, status: number) => NextResponse.json({ success: false, error }, { status });

export async function POST(request: Request) {
    // Turnstile switched off: there is nothing to verify, so the endpoint does not exist.
    if (!features.turnstile) return notFoundResponse();

    const isAllowed = isAllowedOrigin(request, siteConfig.domain, devOrigins);

    if (!isAllowed) {
        const origin = request.headers.get('origin') || '';
        const referer = request.headers.get('referer') || '';
        console.warn(`[SECURITY] Blocked request from origin: ${origin} / referer: ${referer}`);
        return fail('Access Denied: Invalid Origin', 403);
    }

    if (isRateLimited(getClientKey(request), 10, 60_000)) {
        return fail('Too many requests', 429);
    }

    let token: unknown;
    try {
        ({ token } = await request.json());
    } catch {
        return fail('Invalid request', 400);
    }

    if (typeof token !== 'string' || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
        return fail('Token missing or malformed', 400);
    }

    const secretKey = getTurnstileSecretKey();

    if (!secretKey) {
        console.error('TURNSTILE_SECRET_KEY is not defined in .env');
        return fail('Server misconfiguration', 500);
    }

    try {
        const verifyResponse = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
                // A slow or hung Cloudflare must not hold this request (and its connection) open.
                signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
            }
        );

        if (!verifyResponse.ok) {
            console.error('[TURNSTILE] siteverify request failed:', verifyResponse.status);
            return fail('Verification service unavailable', 502);
        }

        const data = await verifyResponse.json();

        if (!data.success) {
            // The codes are useful to you, not to a caller probing the endpoint, so they stay in the log.
            console.warn('[TURNSTILE] Invalid token or bot detected:', data['error-codes']);
            return fail('Verification failed', 403);
        }

        // Real tokens are bound to the site they were solved on. The test keys used in development return a
        // placeholder hostname, so the check only applies to production.
        if (!isDevelopment && data.hostname && !allowedHostnames.has(data.hostname)) {
            console.warn('[TURNSTILE] Token issued for an unexpected hostname:', data.hostname);
            return fail('Verification failed', 403);
        }

        const response = NextResponse.json({ success: true });
        if (!grantAccess(response)) return fail('Server misconfiguration', 500);
        return response;
    } catch (error) {
        if (error instanceof DOMException && error.name === 'TimeoutError') {
            console.error('[TURNSTILE] siteverify timed out');
            return fail('Verification service unavailable', 504);
        }
        // reports any failed connection (timeout, no route, DNS) as "fetch failed".
        if (error instanceof TypeError && error.message === 'fetch failed') {
            console.error('[TURNSTILE] cannot reach siteverify:', (error.cause as { code?: string } | undefined)?.code);
            return fail('Verification service unreachable', 502);
        }
        console.error('[API VERIFY] Internal error:', error);
        return fail('Internal server error', 500);
    }
}

export async function GET() {
    if (!features.turnstile) return notFoundResponse();
    return NextResponse.redirect(`https://${siteConfig.domain}/`);
}
