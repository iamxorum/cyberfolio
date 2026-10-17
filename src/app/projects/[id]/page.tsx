import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { siteConfig, projects } from '@/config';
import { getContributionStatsForProjects } from '@/lib/github-contributions';
import ProjectDetailClient from './ProjectDetailClient';
import { serializeJsonLd } from '@/lib/json-ld';

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

  const siteUrl = `https://${siteConfig.domain}`;
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

  const siteUrl = `https://${siteConfig.domain}`;
  const pageUrl = `${siteUrl}/projects/${project.id}`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Projects', item: `${siteUrl}/projects` },
      { '@type': 'ListItem', position: 3, name: project.name, item: pageUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <ProjectDetailClient project={project} contributionStats={contributionStats[project.id]} />
    </>
  );
}
