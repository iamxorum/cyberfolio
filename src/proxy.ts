import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { siteConfig } from '@/config';

const redirectHosts = new Set([
  `www.${siteConfig.domain}`,
  ...(siteConfig.alternateDomains ?? []).flatMap((domain) => [domain, `www.${domain}`]),
]);

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  if (redirectHosts.has(hostname)) {
    const url = request.nextUrl.clone();
    url.hostname = siteConfig.domain;
    url.port = '';
    url.protocol = 'https';
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/:path*',
};
