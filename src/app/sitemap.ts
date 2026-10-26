import type { MetadataRoute } from 'next';
import { features, projects } from '@/config';
import { getAllPosts, getAllTags } from '@/lib/blog';
import { changelogEnabled } from '@/lib/changelog';
import { siteUrl } from '@/lib/seo';

// Re-read content/blog at most this often, so new posts reach the sitemap without a rebuild.
export const revalidate = 60;

// `lastModified` only appears where a real date exists (posts). A date stamped at build time would
// tell crawlers every page changed on every deploy, and they learn to ignore it.
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const newestPost = posts.map((post) => post.updated || post.date).filter(Boolean).sort().at(-1);

  return [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/projects`, changeFrequency: 'monthly', priority: 0.8 },
    ...projects
      .filter((project) => project.visibility === 'public')
      .map((project) => ({ url: `${siteUrl}/projects/${project.id}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    ...(features.blog
      ? [{ url: `${siteUrl}/blog`, lastModified: newestPost, changeFrequency: 'weekly' as const, priority: 0.6 }]
      : []),
    ...(features.life ? [{ url: `${siteUrl}/life`, changeFrequency: 'weekly' as const, priority: 0.5 }] : []),
    ...(changelogEnabled ? [{ url: `${siteUrl}/changelog`, changeFrequency: 'monthly' as const, priority: 0.3 }] : []),
    { url: `${siteUrl}/privacy`, changeFrequency: 'yearly' as const, priority: 0.2 },
    ...(features.blog
      ? getAllTags().map((tag) => ({ url: `${siteUrl}/blog/tag/${encodeURIComponent(tag)}`, changeFrequency: 'monthly' as const, priority: 0.3 }))
      : []),
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updated || post.date || undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
