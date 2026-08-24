import type { Metadata } from 'next';
import { siteConfig } from '@/config';
import SummaryView from '@/components/SummaryView';

const siteUrl = `https://${siteConfig.domain}`;
const pageUrl = `${siteUrl}/summary`;
const ogImage = `${siteUrl}/opengraph-image`;
const title = `Summary | ${siteConfig.fullName}`;
const description = `A quick, plain-language overview of ${siteConfig.fullName}'s experience, projects, and how to get in touch.`;

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
    { '@type': 'ListItem', position: 2, name: 'Summary', item: pageUrl },
  ],
};

export default function SummaryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <SummaryView />
    </>
  );
}
