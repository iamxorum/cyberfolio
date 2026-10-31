import { NextResponse } from 'next/server';
import { features } from '@/config';
import { guardFeatureRequest } from '@/lib/http';
import { getPersonalBests } from '@/lib/strava';

export const dynamic = 'force-dynamic';

// Polled by the Life page while the personal bests are still being fetched; `bests` is null until they land.
export async function GET(request: Request) {
  const blocked = guardFeatureRequest(request, features.life && features.strava);
  if (blocked) return blocked;
  return NextResponse.json({ bests: await getPersonalBests() }, { headers: { 'Cache-Control': 'no-store' } });
}
