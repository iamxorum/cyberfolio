import { NextResponse } from 'next/server';
import { features, siteConfig } from '@/config';
import { isDevelopment } from '@/lib/env';
import { isAllowedOrigin } from '@/lib/origin';

export const notFoundResponse = () => new NextResponse('Not found', { status: 404 });

/** Gate for a feature's endpoint: 404 when the feature is off, a redirect home for foreign origins. */
export function guardFeatureRequest(request: Request, enabled: boolean): NextResponse | null {
  if (!enabled) return notFoundResponse();
  if (!isDevelopment && !isAllowedOrigin(request, siteConfig.domain)) {
    return NextResponse.redirect(`https://${siteConfig.domain}/`);
  }
  return null;
}

/** Gate for the stat-card endpoints. */
export const guardStatsRequest = (request: Request) => guardFeatureRequest(request, features.systemStats);
