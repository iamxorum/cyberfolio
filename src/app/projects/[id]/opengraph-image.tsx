import { projects, siteConfig } from '@/config';
import { generateContentImage, generateSocialImage } from '@/lib/og-image';

export const alt = 'Project';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Only public projects have a page (and so a card); anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return projects.filter((p) => p.visibility === 'public').map((p) => ({ id: p.id }));
}

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id && p.visibility === 'public');
  if (!project) return generateSocialImage();

  const statuses = Array.isArray(project.status) ? project.status : [project.status];
  return generateContentImage({
    prompt: `${siteConfig.username}@projects:~$ cat ${project.id}.yaml`,
    title: project.name,
    meta: [project.category, ...statuses].join(' · '),
    tags: project.tags,
  });
}
