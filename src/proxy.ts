import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { siteConfig } from '@/config';

const wwwHost = `www.${siteConfig.domain}`;

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  if (hostname === wwwHost) {
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
