import { features, siteConfig } from '@/config';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { markdownToHtml } from '@/lib/blog-html';
import { siteUrl } from '@/lib/seo';

// Re-read content/blog at most this often, so new posts reach the feed without a rebuild.
export const revalidate = 60;

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c] as string));

// Frontmatter dates are plain strings; an unparsable one is left out rather than emitting an invalid pubDate.
const toRfc822 = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toUTCString();
};

// Text can't contain `]]>` inside a CDATA section; split it across two sections.
const cdata = (html: string) => `<![CDATA[${html.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;

export async function GET() {
  if (!features.blog) return new Response('Not found', { status: 404 });
  const posts = getAllPosts();
  const lastBuild = posts.map((p) => toRfc822(p.date)).find(Boolean) ?? new Date().toUTCString();

  const items = (await Promise.all(posts
    .map(async (post) => {
      const body = getPostBySlug(post.slug)?.content;
      const html = body ? await markdownToHtml(body) : '';
      const url = `${siteUrl}/blog/${post.slug}`;
      const pubDate = toRfc822(post.date);
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        pubDate ? `      <pubDate>${pubDate}</pubDate>` : '',
        `      <description>${escapeXml(post.excerpt)}</description>`,
        html ? `      <content:encoded>${cdata(html)}</content:encoded>` : '',
        post.category ? `      <category>${escapeXml(post.category)}</category>` : '',
        ...(post.tags ?? []).map((tag) => `      <category>${escapeXml(tag)}</category>`),
        '    </item>',
      ].filter(Boolean).join('\n');
    })))
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
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
