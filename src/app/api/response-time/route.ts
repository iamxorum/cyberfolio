import { NextResponse } from 'next/server';
import { features, siteConfig } from '@/config';
import { isAllowedOrigin } from '@/lib/origin';

export async function GET(request: Request) {
  // The stat cards are switched off, so this endpoint does not exist.
  if (!features.systemStats) return new NextResponse('Not found', { status: 404 });

  const isDevelopment = process.env.NODE_ENV === 'development';

  const isAllowed = isDevelopment || isAllowedOrigin(request, siteConfig.domain);

  if (!isAllowed) {
    return NextResponse.redirect(`https://${siteConfig.domain}/`);
  }

  const startTime = Date.now();


  await new Promise(resolve => setTimeout(resolve, 1));

  const responseTime = Date.now() - startTime;

  return NextResponse.json({
    responseTime: `${responseTime}ms`,
    ms: responseTime
  });
}

