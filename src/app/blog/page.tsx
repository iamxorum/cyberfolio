import type { Metadata } from 'next';
import { siteConfig } from '@/config';
import { getAllPosts } from '@/lib/blog';
import BlogClient from './BlogClient';

const siteUrl = `https://${siteConfig.domain}`;
const pageUrl = `${siteUrl}/blog`;
const ogImage = `${siteUrl}/opengraph-image`;
const title = `Blog | ${siteConfig.fullName}`;
const description = `Notes and write-ups from ${siteConfig.fullName}.`;

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
    { '@type': 'ListItem', position: 2, name: 'Blog', item: pageUrl },
  ],
};

export default function Blog() {
  const posts = getAllPosts();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogClient posts={posts} />
    </>
  );
}
