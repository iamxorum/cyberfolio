import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { features, siteConfig } from '@/config';
import { getAllPosts, getAllTags } from '@/lib/blog';
import { getPostViews } from '@/lib/umami';
import BlogClient from '../../BlogClient';
import { EMPTY_FILTERS } from '../../filters';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

// Posts live in the mounted content/ folder, so new tags are picked up without a rebuild.
export const revalidate = 60;

interface PageProps {
  params: Promise<{ tag: string }>;
}

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

const tagFromParam = (raw: string) => {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const tag = tagFromParam((await params).tag);
  if (!getAllTags().includes(tag)) return {};
  return pageMetadata({
    path: `/blog/tag/${encodeURIComponent(tag)}`,
    title: `Posts tagged "${tag}" | ${siteConfig.fullName}`,
    description: `Posts about ${tag} from ${siteConfig.fullName}.`,
  });
}

// The same list and filters as /blog, opened already narrowed to one tag, at an address search engines can index.
export default async function BlogTag({ params }: PageProps) {
  if (!features.blog) notFound();
  const tag = tagFromParam((await params).tag);
  if (!getAllTags().includes(tag)) notFound();

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Blog', path: '/blog' },
    { name: tag, path: `/blog/tag/${encodeURIComponent(tag)}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <BlogClient posts={getAllPosts()} views={await getPostViews()} initialFilters={{ ...EMPTY_FILTERS, tags: [tag] }} />
    </>
  );
}
