import { notFound } from 'next/navigation';
import { features, siteConfig } from '@/config';
import { extractHeadings, getAllPosts, getPostBySlug } from '@/lib/blog';
import { getPostViews } from '@/lib/umami';
import BlogClient from './BlogClient';
import { parseFilters } from './filters';
import MdxContent from './[slug]/MdxContent';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, pageMetadata, siteUrl } from '@/lib/seo';

export const metadata = pageMetadata({
  path: '/blog',
  title: `Blog | ${siteConfig.fullName}`,
  description: `Notes and write-ups from ${siteConfig.fullName}.`,
  alternates: { types: { 'application/rss+xml': `${siteUrl}/blog/rss.xml` } },
});

const breadcrumbs = breadcrumbJsonLd([{ name: 'Blog', path: '/blog' }]);

export default async function Blog({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  if (!features.blog) notFound();
  const posts = getAllPosts();
  const views = await getPostViews();
  // `?post=<slug>` opens a post beside the list on ultrawide screens; it is rendered here, on the server.
  const params = await searchParams;
  const slug = Array.isArray(params.post) ? params.post[0] : params.post;
  const open = slug ? getPostBySlug(slug) : null;

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <BlogClient posts={posts} views={views} openSlug={open?.slug} openBody={open && <MdxContent source={open.content} />} openHeadings={open ? extractHeadings(open.content) : undefined} initialFilters={parseFilters(params)} />
    </>
  );
}
