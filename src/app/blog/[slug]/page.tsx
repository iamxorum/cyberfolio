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

  return (
    <BlogPostClient title={post.title} date={post.date} tags={post.tags}>
      <MdxContent source={post.content} />
    </BlogPostClient>
  );
}
