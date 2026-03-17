import { NextResponse } from 'next/server';
import { siteConfig } from '@/config';

export async function GET(request: Request) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const isDevelopment = process.env.NODE_ENV === 'development';

  const isAllowed = isDevelopment ||
    origin === `https://${siteConfig.domain}` ||
    referer?.startsWith(`https://${siteConfig.domain}`);

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

