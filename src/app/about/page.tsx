import type { Metadata } from 'next';
import { siteConfig } from '@/config';
import AboutClient from './AboutClient';

const siteUrl = `https://${siteConfig.domain}`;
const pageUrl = `${siteUrl}/about`;
const ogImage = `${siteUrl}/opengraph-image`;
const title = `About | ${siteConfig.fullName}, ${siteConfig.role}`;
const description = `${siteConfig.role} | background, projects, skills, education, and certifications.`;

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
    { '@type': 'ListItem', position: 2, name: 'About', item: pageUrl },
  ],
};

export default function About() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <AboutClient />
    </>
  );
}
