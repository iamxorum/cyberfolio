import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig } from '@/config';
import { getAllPostSlugs, getPostBySlug } from '@/lib/blog';
import BlogPostClient from './BlogPostClient';
import MdxContent from './MdxContent';

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
  const ogImage = `${siteUrl}/opengraph-image`;
  const title = `${post.title} | ${siteConfig.fullName}`;

  return {
    title,
    description: post.excerpt,
    alternates: { canonical: pageUrl },
    openGraph: { title, description: post.excerpt, url: pageUrl, images: [ogImage], type: 'article', publishedTime: post.date },
    twitter: { title, description: post.excerpt, images: [ogImage] },
  };
}

export default async function BlogPost({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const siteUrl = `https://${siteConfig.domain}`;
  const pageUrl = `${siteUrl}/blog/${slug}`;
  const ogImage = `${siteUrl}/opengraph-image`;

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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(postJsonLd) }}
      />
      <BlogPostClient title={post.title} date={post.date} tags={post.tags}>
        <MdxContent source={post.content} />
      </BlogPostClient>
    </>
  );
}
