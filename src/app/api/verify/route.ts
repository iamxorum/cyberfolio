import { NextResponse } from 'next/server';
import { siteConfig } from '@/config';
import { isRateLimited, getClientKey } from '@/lib/rate-limit';
import { getTurnstileSecretKey } from '@/lib/turnstile';

const isDevelopment = process.env.NODE_ENV === 'development';

const ALLOWED_ORIGINS = [
    `https://${siteConfig.domain}`,
    `https://www.${siteConfig.domain}`,
    ...(isDevelopment ? ['http://localhost:3000'] : []),
];

export async function POST(request: Request) {
    const origin = request.headers.get('origin') || '';
    const referer = request.headers.get('referer') || '';

    const isAllowed = ALLOWED_ORIGINS.includes(origin) ||
        ALLOWED_ORIGINS.some(allowed => referer.startsWith(allowed));

    if (!isAllowed) {
        console.warn(`[SECURITY] Blocked request from origin: ${origin} / referer: ${referer}`);
        return NextResponse.json({ success: false, error: 'Access Denied: Invalid Origin' }, { status: 403 });
    }

    if (isRateLimited(getClientKey(request), 10, 60_000)) {
        return NextResponse.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }

    try {
        const body = await request.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Token missing' }, { status: 400 });
        }

        const secretKey = getTurnstileSecretKey();

        if (!secretKey) {
            console.error("TURNSTILE_SECRET_KEY is not defined in .env");
            return NextResponse.json({ success: false, error: 'Server misconfiguration' }, { status: 500 });
        }

        const verifyResponse = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
            }
        );

        const data = await verifyResponse.json();

        if (data.success) {
            return NextResponse.json({ success: true });
        } else {
            console.warn("[TURNSTILE] Invalid token or bot detected:", data['error-codes']);
            return NextResponse.json({ success: false, error: data['error-codes'] }, { status: 403 });
        }
    } catch (error) {
        console.error('[API VERIFY] Internal error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.redirect(`https://${siteConfig.domain}/`);
}