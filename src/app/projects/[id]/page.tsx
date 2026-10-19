import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig, projects } from '@/config';
import { getContributionStatsForProjects } from '@/lib/github-contributions';
import ProjectDetailClient from './ProjectDetailClient';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, siteUrl } from '@/lib/seo';

// Private projects are listed but deliberately not linked, so they get no page; unknown ids 404 too.
export const dynamicParams = false;

const publicProjects = projects.filter((p) => p.visibility === 'public');

interface PageProps {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return publicProjects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const project = publicProjects.find((p) => p.id === id);
  if (!project) return {};

  const pageUrl = `${siteUrl}/projects/${project.id}`;
  const title = `${project.name} | ${siteConfig.fullName}`;
  const description = project.cvDescription || project.description;

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    // The image comes from this segment's opengraph-image.tsx (a card with the project's name, status and stack).
    openGraph: { title, description, url: pageUrl },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const project = publicProjects.find((p) => p.id === id);
  if (!project) notFound();

  const contributionStats = await getContributionStatsForProjects(projects, siteConfig.username);

  const breadcrumbs = breadcrumbJsonLd([
    { name: 'Projects', path: '/projects' },
    { name: project.name, path: `/projects/${project.id}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ProjectDetailClient project={project} contributionStats={contributionStats[project.id]} />
    </>
  );
}
