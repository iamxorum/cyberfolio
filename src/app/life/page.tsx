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

export default function Life() {
  if (!features.life) notFound();
  // Not awaited: the page shell streams at once and each section fills in behind a skeleton.
  // Skipped entirely when a feature is off, so no credentials or network access are needed.
  const running = features.strava ? getRunningData() : Promise.resolve(null);
  const gaming = features.steam ? getGamingData() : Promise.resolve(null);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <LifeClient running={running} gaming={gaming} />
    </>
  );
}
