import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { siteConfig } from '@/config';

const redirectHosts = new Set(
  (siteConfig.alternateDomains ?? []).flatMap((domain) => [domain, `www.${domain}`])
);

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';

  if (redirectHosts.has(host)) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    url.host = siteConfig.domain;
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
