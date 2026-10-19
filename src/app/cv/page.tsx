import { notFound } from 'next/navigation';
import { features, siteConfig, projects } from '@/config';
import { getContributionStatsForProjects } from '@/lib/github-contributions';
import CVClient from './CVClient';
import AccessGate from '@/components/AccessGate';
import { hasAccess } from '@/lib/access';
import { contactEmail, contactPhone } from '@/lib/contact';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  path: '/cv',
  title: `CV | ${siteConfig.fullName}`,
  description: `ATS-optimized CV for ${siteConfig.fullName}, ${siteConfig.role}.`,
  robots: { index: false, follow: true },
});

export default async function CVPage() {
  if (!features.cv) notFound();
  if (!(await hasAccess())) return <AccessGate />;

  const contributionStats = await getContributionStatsForProjects(projects, siteConfig.username);
  return <CVClient contributionStats={contributionStats} email={contactEmail() ?? undefined} phone={contactPhone() ?? undefined} />;
}
