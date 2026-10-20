import { notFound } from 'next/navigation';
import { features, siteConfig } from '@/config';
import { getRunningData } from '@/lib/strava';
import { getGamingData } from '@/lib/steam';
import { lifeTopics } from '@/lib/life-topics';
import LifeClient from './LifeClient';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

// Rendered per request from the in-memory Strava/Steam caches; their creds only exist at runtime, not at build.
export const dynamic = 'force-dynamic';

export const metadata = pageMetadata({
  path: '/life',
  title: `Life | ${siteConfig.fullName}`,
  description: `Off the clock: ${lifeTopics()} by ${siteConfig.fullName}.`,
});

const breadcrumbs = breadcrumbJsonLd([{ name: 'Life', path: '/life' }]);

export default async function Life() {
  if (!features.life) notFound();
  // Skipped entirely when the feature is off, so no Strava credentials or network access are needed.
  const running = features.strava ? await getRunningData() : null;

  const gaming = features.steam ? await getGamingData() : null;

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <LifeClient running={running} gaming={gaming} />
    </>
  );
}
