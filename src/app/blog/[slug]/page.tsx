import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config';
import { extractHeadings, getAdjacentPosts, getAllPostSlugs, getPostBySlug } from '@/lib/blog';
import BlogPostClient from './BlogPostClient';
import MdxContent from './MdxContent';
import { serializeJsonLd } from '@/lib/json-ld';

// Only the slugs listed by generateStaticParams exist; anything else is a 404, never rendered on demand.
export const dynamicParams = false;

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

  const siteUrl = `https://${siteConfig.domain}`;
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

  const siteUrl = `https://${siteConfig.domain}`;
  const pageUrl = `${siteUrl}/blog/${slug}`;
  const ogImage = `${pageUrl}/opengraph-image`;
  const { previous, next } = getAdjacentPosts(slug);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: pageUrl },
    ],
  };

  const postJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: ogImage,
    datePublished: post.date,
    dateModified: post.date,
    url: pageUrl,
    keywords: post.tags?.join(', '),
    author: { '@type': 'Person', name: siteConfig.fullName, url: siteUrl },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(postJsonLd) }}
      />
      <BlogPostClient title={post.title} date={post.date} tags={post.tags} readingMinutes={post.readingMinutes} headings={extractHeadings(post.content)} previous={previous} next={next}>
        <MdxContent source={post.content} />
      </BlogPostClient>
    </>
  );
}
