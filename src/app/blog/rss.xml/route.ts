import { features, siteConfig } from '@/config';
import { getAllPosts } from '@/lib/blog';

export const dynamic = 'force-static';

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string));

// Frontmatter dates are plain strings; an unparsable one is left out rather than emitting an invalid pubDate.
const toRfc822 = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toUTCString();
};

export function GET() {
  if (!features.blog) return new Response('Not found', { status: 404 });
  const siteUrl = `https://${siteConfig.domain}`;
  const posts = getAllPosts();
  const lastBuild = posts.map((p) => toRfc822(p.date)).find(Boolean) ?? new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      const pubDate = toRfc822(post.date);
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : '',
        `      <description>${escapeXml(post.excerpt)}</description>`,
        ...(post.tags ?? []).map((tag) => `      <category>${escapeXml(tag)}</category>`),
        '    </item>',
      ].filter(Boolean).join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`Blog | ${siteConfig.fullName}`)}</title>
    <link>${siteUrl}/blog</link>
    <description>${escapeXml(`Notes and write-ups from ${siteConfig.fullName}.`)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
