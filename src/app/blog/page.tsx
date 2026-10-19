import { notFound } from 'next/navigation';
import { features, siteConfig } from '@/config';
import { getAllPosts } from '@/lib/blog';
import { getPostViews } from '@/lib/umami';
import BlogClient from './BlogClient';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, pageMetadata, siteUrl } from '@/lib/seo';

export const metadata = pageMetadata({
  path: '/blog',
  title: `Blog | ${siteConfig.fullName}`,
  description: `Notes and write-ups from ${siteConfig.fullName}.`,
  alternates: { types: { 'application/rss+xml': `${siteUrl}/blog/rss.xml` } },
});

const breadcrumbs = breadcrumbJsonLd([{ name: 'Blog', path: '/blog' }]);

// Rebuilt in the background at most this often so the view counts stay fresh.
export const revalidate = 600;

export default async function Blog() {
  if (!features.blog) notFound();
  const posts = getAllPosts();
  const views = await getPostViews();

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <BlogClient posts={posts} views={views} />
    </>
  );
}
