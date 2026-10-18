import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { features, siteConfig } from '@/config';
import { getRunningData } from '@/lib/strava';
import { lifeTopics } from '@/lib/life-topics';
import LifeClient from './LifeClient';
import { serializeJsonLd } from '@/lib/json-ld';

// Rendered per request from the in-memory Strava cache; Strava creds only exist at runtime, not at build.
export const dynamic = 'force-dynamic';

const siteUrl = `https://${siteConfig.domain}`;
const pageUrl = `${siteUrl}/life`;
const ogImage = `${siteUrl}/opengraph-image`;
const title = `Life | ${siteConfig.fullName}`;
const description = `Off the clock: ${lifeTopics()} by ${siteConfig.fullName}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: { title, description, url: pageUrl, images: [ogImage] },
  twitter: { title, description, images: [ogImage] },
};

const breadcrumbJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'Life', item: pageUrl },
  ],
};

export default async function Life() {
  if (!features.life) notFound();
  // Skipped entirely when the feature is off, so no Strava credentials or network access are needed.
  const running = features.strava ? await getRunningData() : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <LifeClient running={running} />
    </>
  );
}
