import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { siteConfig } from '@/config';

const { security } = siteConfig;

// Where browsers report blocked content; see app/api/csp-report. `report-uri` covers browsers without the Reporting API.
const CSP_REPORT_PATH = '/api/csp-report';

const isDev = process.env.NODE_ENV === 'development';

const redirectHosts = new Set([
  `www.${siteConfig.domain}`,
  ...(siteConfig.alternateDomains ?? []).flatMap((domain) => [domain, `www.${domain}`]),
]);

// Built per request because script-src carries a fresh nonce: only scripts that present it run, so injected markup cannot execute.
// 'strict-dynamic' lets those trusted scripts load others (the Turnstile widget); browsers that honour it ignore the host list,
// which stays only as a fallback for the rest.
// connect-src allows data: because yoga-layout (inside @react-pdf, used for the CV PDFs) fetches its inlined WASM from a data: URL.
function buildCsp(nonce: string) {
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'wasm-unsafe-eval' ${security.scripts.join(' ')};
    style-src 'self' 'unsafe-inline' ${security.styles.join(' ')};
    img-src 'self' blob: data: ${security.images.join(' ')};
    font-src 'self' ${security.fonts.join(' ')};
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src 'self' ${security.frames.join(' ')};
    connect-src 'self' data: iamxorum.ro *.iamxorum.ro ${security.connects.join(' ')};
    worker-src 'self' blob:;
    upgrade-insecure-requests;
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
  const csp = buildCsp(nonce);

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
