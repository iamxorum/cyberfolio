import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config';
import { extractHeadings, getAdjacentPosts, getAllPostSlugs, getPostBySlug, getRelatedPosts } from '@/lib/blog';
import { getPostViews } from '@/lib/umami';
import BlogPostClient from './BlogPostClient';
import MdxContent from './MdxContent';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, siteUrl } from '@/lib/seo';

// Only the slugs listed by generateStaticParams exist; anything else is a 404, never rendered on demand.
export const dynamicParams = false;

// Pages are built once, then rebuilt in the background at most this often so the view count stays fresh.
export const revalidate = 600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const pageUrl = `${siteUrl}/blog/${slug}`;
  const title = `${post.title} | ${siteConfig.fullName}`;

  return {
    title,
    description: post.excerpt,
    alternates: { canonical: pageUrl },
    // The image comes from this segment's opengraph-image.tsx (a card with the post's own title and tags).
    openGraph: { title, description: post.excerpt, url: pageUrl, type: 'article', publishedTime: post.date, tags: post.tags },
    twitter: { card: 'summary_large_image', title, description: post.excerpt },
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const pageUrl = `${siteUrl}/blog/${slug}`;
  const ogImage = `${pageUrl}/opengraph-image`;
  const { previous, next } = getAdjacentPosts(slug);
  const related = getRelatedPosts(slug);
  const views = (await getPostViews())[slug];

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${slug}` },
  ]);

  const postJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: ogImage,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    url: pageUrl,
    keywords: post.tags?.join(', '),
    author: { '@type': 'Person', name: siteConfig.fullName, url: siteUrl },
  };

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <JsonLd data={postJsonLd} />
      <BlogPostClient title={post.title} date={post.date} tags={post.tags} readingMinutes={post.readingMinutes} headings={extractHeadings(post.content)} previous={previous} next={next} related={related} views={views}>
        <MdxContent source={post.content} />
      </BlogPostClient>
    </>
  );
}
