import { siteConfig, projects } from '@/config';
import { getContributionStatsForProjects } from '@/lib/github-contributions';
import ProjectsClient from './ProjectsClient';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  path: '/projects',
  title: `Projects | ${siteConfig.fullName}`,
  description: `Selected projects and work by ${siteConfig.fullName}, ${siteConfig.role}.`,
});

const breadcrumbs = breadcrumbJsonLd([{ name: 'Projects', path: '/projects' }]);

export default async function Projects() {
  const contributionStats = await getContributionStatsForProjects(projects, siteConfig.username);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ProjectsClient contributionStats={contributionStats} />
    </>
  );
}
