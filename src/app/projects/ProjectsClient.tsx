'use client';

import { useState } from 'react';
import PageShell, { PageHeading } from '@/components/PageShell';
import UltrawideDetail from '@/components/UltrawideDetail';
import { ProjectDetailContent } from './[id]/ProjectDetailClient';
import { useUltrawide } from '@/hooks/useUltrawide';
import Link from 'next/link';
import { projects, contentConfig } from '@/config';
import ProjectsTable from '@/components/projects/ProjectsTable';
import { NO_CONTRIBUTION_STATS, type ContributionStats } from '@/lib/github-contributions';

interface ProjectsClientProps {
  contributionStats?: Record<string, ContributionStats | null>;
}

export default function ProjectsClient({ contributionStats = NO_CONTRIBUTION_STATS }: ProjectsClientProps) {
  const ultrawide = useUltrawide();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = projects.find((p) => p.id === selectedId && p.visibility === 'public');
  const onSelect = ultrawide ? setSelectedId : undefined;

  const personalProjects = projects.filter((p) => p.projectType === 'personal');
  const contributionProjects = projects.filter((p) => p.projectType === 'contribution');

  return (
    <PageShell crumbs={[{ label: 'projects.yaml', href: '/projects' }]} rail>
      <div className="uw-panel uw-panel-list flex flex-col gap-4 sm:gap-6 md:gap-8">
      <PageHeading
        title={contentConfig.projects.title}
        subtitle={contentConfig.projects.subtitle}
        aside={
          <Link href="/" className="group flex items-center justify-center gap-2 rounded h-9 sm:h-10 px-3 sm:px-5 bg-[var(--terminal-border-alt)] hover:bg-[var(--terminal-border)] transition text-[var(--terminal-text)] text-xs sm:text-sm font-bold tracking-wide border border-transparent hover:border-[var(--terminal-text-dim)]">
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            <span className="hidden sm:inline">CD .. [ RETURN_HOME ]</span>
            <span className="sm:hidden">HOME</span>
          </Link>
        }
      />
      <div className="flex flex-col gap-6 sm:gap-8">
        <ProjectsTable title="Projects" icon="folder" projects={personalProjects} contributionStats={contributionStats} onSelect={onSelect} selectedId={selected?.id} />
        {contributionProjects.length > 0 && (
          <ProjectsTable title="Contributions" icon="group" projects={contributionProjects} contributionStats={contributionStats} onSelect={onSelect} selectedId={selected?.id} />
        )}
      </div>
      </div>
      {ultrawide && (
        <UltrawideDetail label="PROJECT">
          {selected && <ProjectDetailContent key={selected.id} embedded project={selected} contributionStats={contributionStats[selected.id]} />}
        </UltrawideDetail>
      )}
    </PageShell>
  );
}
