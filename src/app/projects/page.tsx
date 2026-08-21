import type { Metadata } from 'next';
import { siteConfig } from '@/config';
import ProjectsClient from './ProjectsClient';

const siteUrl = `https://${siteConfig.domain}`;
const pageUrl = `${siteUrl}/projects`;
const ogImage = `${siteUrl}/opengraph-image`;
const title = `Projects — ${siteConfig.fullName}`;
const description = `Selected projects and work by ${siteConfig.fullName}, ${siteConfig.role}.`;

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
    { '@type': 'ListItem', position: 2, name: 'Projects', item: pageUrl },
  ],
};

export default function Projects() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProjectsClient />
    </>
  );
}
