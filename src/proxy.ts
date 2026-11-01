import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { siteConfig } from '@/config';

const { security } = siteConfig;

// Where browsers report blocked content; see app/api/csp-report. `report-uri` covers browsers without the Reporting API.
const CSP_REPORT_PATH = `https://${siteConfig.domain}/api/csp-report`;

const isDev = process.env.NODE_ENV === 'development';

const redirectHosts = new Set([
  `www.${siteConfig.domain}`,
  ...(siteConfig.alternateDomains ?? []).flatMap((domain) => [domain, `www.${domain}`]),
]);

// Built per request: script-src carries a fresh nonce, so injected markup cannot run.
// 'strict-dynamic' lets nonced scripts load others (Turnstile); the host list is a fallback for older browsers.
// connect-src allows data: because yoga-layout (inside @react-pdf) fetches inlined WASM from a data: URL.
// upgrade-insecure-requests is left out on localhost: Safari would rewrite every asset to https://localhost, which nothing serves.
function buildCsp(nonce: string, local: boolean) {
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval' ${security.scripts.join(' ')};
    style-src 'self' 'unsafe-inline' ${security.styles.join(' ')};
    img-src 'self' blob: data: ${security.images.join(' ')};
    font-src 'self' ${security.fonts.join(' ')};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    frame-src 'self' ${security.frames.join(' ')};
    connect-src 'self' data: ${security.connects.join(' ')};
    worker-src 'self' blob:;
    ${local ? '' : 'upgrade-insecure-requests;'}
    report-uri ${CSP_REPORT_PATH};
    report-to csp-endpoint;
  `.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim();
}

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') || '';

  if (redirectHosts.has(hostname)) {
    const url = request.nextUrl.clone();
    url.hostname = siteConfig.domain;
    url.port = '';
    url.protocol = 'https';
    return NextResponse.redirect(url, 301);
  }

  // The dev server needs eval and websockets for hot reload, so development runs without a CSP.
  if (isDev) return NextResponse.next();

  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce, /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(hostname));

  // Next reads the nonce from the request's CSP header and stamps it on its own scripts; the layout reads x-nonce for the inline ones.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Reporting-Endpoints', `csp-endpoint="${CSP_REPORT_PATH}"`);
  return response;
}

export const config = {
  matcher: '/:path*',
};
