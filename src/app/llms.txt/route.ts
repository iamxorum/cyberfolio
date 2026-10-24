import { features, projects, siteConfig } from '@/config';
import { getAllPosts } from '@/lib/blog';
import { changelogEnabled } from '@/lib/changelog';
import { siteUrl } from '@/lib/seo';

// Re-read content/blog at most this often, so new posts reach the file without a rebuild.
export const revalidate = 60;

const oneLine = (text: string) => text.replace(/\s+/g, ' ').trim();
const entry = (name: string, url: string, note?: string) => `- [${name}](${url})${note ? `: ${oneLine(note)}` : ''}`;

// Follows the llms.txt convention (llmstxt.org): a title, a one-line summary, then lists of links.
export function GET() {
  const pages = [
    entry('About', `${siteUrl}/about`, 'Background, experience, education, skills and certifications.'),
    entry('Projects', `${siteUrl}/projects`, 'Selected projects and open source contributions.'),
    ...(features.blog ? [entry('Blog', `${siteUrl}/blog`, 'Notes and write-ups.')] : []),
    ...(changelogEnabled ? [entry('Changelog', `${siteUrl}/changelog`, 'Release history of this site.')] : []),
    ...(features.life ? [entry('Life', `${siteUrl}/life`, 'Off the clock: running, hobbies, gaming and music.')] : []),
  ];

  const publicProjects = projects
    .filter((project) => project.visibility === 'public')
    .map((project) => entry(project.name, `${siteUrl}/projects/${project.id}`, project.cvDescription ?? project.description));

  const posts = features.blog
    ? getAllPosts().map((post) => entry(post.title, `${siteUrl}/blog/${post.slug}`, post.excerpt))
    : [];

  const sections = [
    `# ${siteConfig.fullName} (${siteConfig.username})`,
    `> ${siteConfig.role}. ${oneLine(siteConfig.description)}`,
    `## Pages\n\n${pages.join('\n')}`,
    ...(publicProjects.length ? [`## Projects\n\n${publicProjects.join('\n')}`] : []),
    ...(posts.length ? [`## Blog posts\n\n${posts.join('\n')}`] : []),
  ];

  return new Response(`${sections.join('\n\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}
