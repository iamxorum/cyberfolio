import { generatePostImage, generateSocialImage } from '@/lib/og-image';
import { getAllPostSlugs, getPostBySlug } from '@/lib/blog';

export const alt = 'Blog post';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Unknown slugs 404 rather than falling through to a generated card.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return generateSocialImage();
  return generatePostImage({ title: post.title, date: post.date, tags: post.tags, readingMinutes: post.readingMinutes });
}
