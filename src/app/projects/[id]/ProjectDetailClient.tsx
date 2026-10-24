'use client';

import Link from 'next/link';
import CopyLinkButton from '@/components/CopyLinkButton';
import PageShell from '@/components/PageShell';
import Reveal from '@/components/Reveal';
import TypedText from '@/components/TypedText';
import { STAGGER_STEP_DENSE_MS, revealDelay } from '@/lib/motion';
import { getProjectHashId, getStatusColorStyles } from '@/lib/project-status';
import type { Project } from '@/config';
import { eventProps } from '@/lib/track';
import type { ContributionStats } from '@/lib/github-contributions';

interface ProjectDetailClientProps {
  project: Project;
  contributionStats?: ContributionStats | null;
}

const isGithubUrl = (url?: string) => !!url && url.includes('github.com');

function StatusBadges({ statuses, statusColors }: { statuses: string[]; statusColors: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {statuses.map((status, idx) => {
        const styles = getStatusColorStyles(statusColors[idx] || statusColors[0]);
        return (
          <span key={status} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${styles.bg} border ${styles.border} ${styles.text} text-xs font-bold font-mono`}>
            {status}
          </span>
        );
      })}
    </div>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  const hasRepoLink = !!project.repository && project.repository !== project.link;
  return (
    <div className="flex flex-wrap gap-3">
      {project.link && (
        <a
          href={project.link}
          {...eventProps('project_link_click', { project: project.id, kind: isGithubUrl(project.link) ? 'source' : 'live' })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded h-10 px-5 bg-primary text-[var(--terminal-on-primary)] text-sm font-bold font-mono tracking-wide hover:bg-primary/80 active:scale-[0.97] transition shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.3)]"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-lg">
            {isGithubUrl(project.link) ? 'code' : 'open_in_new'}
          </span>
          {isGithubUrl(project.link) ? 'VIEW_SOURCE' : 'OPEN_LIVE'}
        </a>
      )}
      {hasRepoLink && (
        <a
          href={project.repository}
          {...eventProps('project_link_click', { project: project.id, kind: 'source' })}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded h-10 px-5 border border-[var(--terminal-border)] hover:border-primary hover:bg-primary/10 text-[var(--terminal-text)] text-sm font-bold font-mono tracking-wide active:scale-[0.97] transition"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-lg">code</span>
          VIEW_SOURCE
        </a>
      )}
    </div>
  );
}

function ContributionLog({ stats }: { stats: ContributionStats }) {
  return (
    <Reveal as="section" className="flex flex-col gap-2">
      <h2 className="text-[var(--terminal-text-dim)] text-xs font-mono uppercase tracking-widest"><TypedText text="Contribution_Log" /></h2>
      <div className="flex flex-wrap items-center gap-3 text-sm font-mono text-[var(--terminal-text-muted)]">
        <a href={stats.searchUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
          {stats.mergedCount} merged PR{stats.mergedCount !== 1 ? 's' : ''}
        </a>
        {stats.reviewCount > 0 && (
          <>
            <span aria-hidden="true">·</span>
            <a href={stats.reviewSearchUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              {stats.reviewCount} review{stats.reviewCount !== 1 ? 's' : ''}
            </a>
          </>
        )}
      </div>
    </Reveal>
  );
}

interface ProjectDetailContentProps extends ProjectDetailClientProps {
  /** Shown beside the projects list (ultrawide) rather than as its own page. */
  embedded?: boolean;
}

export function ProjectDetailContent({ project, contributionStats, embedded = false }: ProjectDetailContentProps) {
  const Title = embedded ? 'h2' : 'h1';
  const statuses = Array.isArray(project.status) ? project.status : [project.status];
  const statusColors = Array.isArray(project.statusColor) ? project.statusColor : [project.statusColor];

  return (
    <>
      <div className="flex flex-col gap-4 border-b border-[var(--terminal-border-alt)] pb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded bg-primary/20 text-primary border border-primary/20 flex-shrink-0">
            <span aria-hidden="true" className="material-symbols-outlined text-3xl">{project.icon}</span>
          </div>
          <div className="flex flex-col gap-2 min-w-0">
            <Title className="animate-reveal text-[var(--terminal-text)] text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight font-mono break-words">
              {project.name}
            </Title>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--terminal-text-dim)]">
              <span>{getProjectHashId(project.id)}</span>
              <span
                className={`inline-flex items-center gap-1 ${project.visibility === 'public' ? 'text-green-400' : 'text-red-400'}`}
                title={project.visibility === 'public' ? 'Public' : 'Private'}
              >
                <span aria-hidden="true" className="material-symbols-outlined text-sm">
                  {project.visibility === 'public' ? 'public' : 'lock'}
                </span>
                {project.visibility}
              </span>
              <span>·</span>
              <span className="uppercase">{project.category}</span>
              <span>·</span>
              <span className="uppercase">{project.type.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>

        <div className="animate-reveal" style={{ animationDelay: '140ms' }}>
          <StatusBadges statuses={statuses} statusColors={statusColors} />
        </div>

        <div className="animate-reveal" style={{ animationDelay: '220ms' }}>
          <ProjectLinks project={project} />
        </div>
      </div>

      <Reveal as="section" className="flex flex-col gap-2">
        <h2 className="text-[var(--terminal-text-dim)] text-xs font-mono uppercase tracking-widest"><TypedText text="README.md" /></h2>
        <p className="text-[var(--terminal-text)] text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {project.description}
        </p>
      </Reveal>

      {project.tags.length > 0 && (
        <Reveal as="section" className="flex flex-col gap-2">
          <h2 className="text-[var(--terminal-text-dim)] text-xs font-mono uppercase tracking-widest"><TypedText text="Tech_Stack" /></h2>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, index) => (
              <span key={tag} data-reveal style={revealDelay(150 + Math.min(index, 12) * STAGGER_STEP_DENSE_MS)} className="scroll-reveal px-2.5 py-1 rounded bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-xs text-[var(--terminal-text-dim)] font-mono whitespace-nowrap">
                {tag}
              </span>
            ))}
          </div>
        </Reveal>
      )}

      {contributionStats && contributionStats.mergedCount > 0 && <ContributionLog stats={contributionStats} />}

      {embedded ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm text-[var(--terminal-text-dim)]">
          <Link
            href={`/projects/${project.id}`}
            className="group inline-flex items-center gap-2 font-mono hover:text-primary transition-colors"
          >
            OPEN_FULL_PAGE
            <span aria-hidden="true" className="material-symbols-outlined text-base group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </Link>
          <CopyLinkButton path={`/projects/${project.id}`} event="project_link_copy" />
        </div>
      ) : (
        <Link
          href="/projects"
          className="group inline-flex items-center gap-2 self-start text-sm font-mono text-[var(--terminal-text-dim)] hover:text-primary transition-colors mt-2"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
          CD .. [ ALL_PROJECTS ]
        </Link>
      )}
    </>
  );
}

export default function ProjectDetailClient({ project, contributionStats }: ProjectDetailClientProps) {
  return (
    <PageShell crumbs={[{ label: 'projects.yaml', href: '/projects' }, { label: project.id }]} width="medium">
      <ProjectDetailContent project={project} contributionStats={contributionStats} />
    </PageShell>
  );
}
