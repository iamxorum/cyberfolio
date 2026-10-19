import { NextResponse } from 'next/server';
import { features, siteConfig } from '@/config';
import { isDevelopment } from '@/lib/env';
import { isAllowedOrigin } from '@/lib/origin';

export const notFoundResponse = () => new NextResponse('Not found', { status: 404 });

/** Gate for the stat-card endpoints: 404 when the cards are off, a redirect home for foreign origins. */
export function guardStatsRequest(request: Request): NextResponse | null {
  if (!features.systemStats) return notFoundResponse();
  if (!isDevelopment && !isAllowedOrigin(request, siteConfig.domain)) {
    return NextResponse.redirect(`https://${siteConfig.domain}/`);
  }
  return null;
}
