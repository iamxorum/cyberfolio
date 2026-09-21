'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { getProjectHashId, getStatusColorStyles } from '@/lib/project-status';
import type { Project } from '@/config';
import type { ContributionStats } from '@/lib/github-contributions';

interface ProjectDetailClientProps {
  project: Project;
  contributionStats?: ContributionStats | null;
}

export default function ProjectDetailClient({ project, contributionStats }: ProjectDetailClientProps) {
  const { initialized, setInitialized } = useAppInitialization();
  const statuses = Array.isArray(project.status) ? project.status : [project.status];
  const statusColors = Array.isArray(project.statusColor) ? project.statusColor : [project.statusColor];
  const isGithubUrl = (url?: string) => !!url && url.includes('github.com');
  const hasRepoLink = !!project.repository && project.repository !== project.link;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-hidden font-display">
      {!initialized && <InitScreen onInit={() => setInitialized(true)} />}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 relative z-10">
          <div className="layout-content-container flex flex-col max-w-[820px] w-full flex-1">
            <main id="main-content" tabIndex={-1}>
              <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm font-mono tracking-wide flex-wrap">
                  <span className="material-symbols-outlined text-[var(--terminal-text-dim)] text-lg">folder_open</span>
                  <Link href="/" className="text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors">~/root</Link>
                  <span className="text-[var(--terminal-text-dim)]">/</span>
                  <Link href="/projects" className="text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors">projects.yaml</Link>
                  <span className="text-[var(--terminal-text-dim)]">/</span>
                  <span className="text-[var(--terminal-text)]">{project.id}</span>
                  <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
                </div>

                {/* Header */}
                <div className="flex flex-col gap-4 border-b border-[var(--terminal-border-alt)] pb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded bg-primary/20 text-primary border border-primary/20 flex-shrink-0">
                      <span className="material-symbols-outlined text-3xl">{project.icon}</span>
                    </div>
                    <div className="flex flex-col gap-2 min-w-0">
                      <h1 className="animate-reveal text-[var(--terminal-text)] text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight font-mono break-words">
                        {project.name}
                      </h1>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--terminal-text-dim)]">
                        <span>{getProjectHashId(project.id)}</span>
                        <span
                          className={`inline-flex items-center gap-1 ${project.visibility === 'public' ? 'text-green-400' : 'text-red-400'}`}
                          title={project.visibility === 'public' ? 'Public' : 'Private'}
                        >
                          <span className="material-symbols-outlined text-sm">
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

                  <div className="flex flex-wrap items-center gap-1.5">
                    {statuses.map((status, idx) => {
                      const styles = getStatusColorStyles(statusColors[idx] || statusColors[0]);
                      return (
                        <span key={idx} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded ${styles.bg} border ${styles.border} ${styles.text} text-xs font-bold font-mono`}>
                          <span className={`size-1.5 rounded-full ${styles.dot}`}></span>
                          {status}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded h-10 px-5 bg-primary text-[var(--terminal-on-primary)] text-sm font-bold font-mono tracking-wide hover:bg-primary/80 active:scale-[0.97] transition shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.3)]"
                      >
                        <span className="material-symbols-outlined text-lg">
                          {isGithubUrl(project.link) ? 'code' : 'open_in_new'}
                        </span>
                        {isGithubUrl(project.link) ? 'VIEW_SOURCE' : 'OPEN_LIVE'}
                      </a>
                    )}
                    {hasRepoLink && (
                      <a
                        href={project.repository}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded h-10 px-5 border border-[var(--terminal-border)] hover:border-primary hover:bg-primary/10 text-[var(--terminal-text)] text-sm font-bold font-mono tracking-wide active:scale-[0.97] transition"
                      >
                        <span className="material-symbols-outlined text-lg">code</span>
                        VIEW_SOURCE
                      </a>
                    )}
                  </div>
                </div>

                {/* Description */}
                <section className="flex flex-col gap-2">
                  <h2 className="text-[var(--terminal-text-dim)] text-xs font-mono uppercase tracking-widest">README.md</h2>
                  <p className="text-[var(--terminal-text)] text-sm sm:text-base leading-relaxed whitespace-pre-line">
                    {project.description}
                  </p>
                </section>

                {/* Tech stack */}
                {project.tags.length > 0 && (
                  <section className="flex flex-col gap-2">
                    <h2 className="text-[var(--terminal-text-dim)] text-xs font-mono uppercase tracking-widest">Tech_Stack</h2>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <span key={tag} className="px-2.5 py-1 rounded bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-xs text-[var(--terminal-text-dim)] font-mono whitespace-nowrap">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Contribution stats */}
                {contributionStats && contributionStats.mergedCount > 0 && (
                  <section className="flex flex-col gap-2">
                    <h2 className="text-[var(--terminal-text-dim)] text-xs font-mono uppercase tracking-widest">Contribution_Log</h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm font-mono text-[var(--terminal-text-muted)]">
                      <a href={contributionStats.searchUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        {contributionStats.mergedCount} merged PR{contributionStats.mergedCount !== 1 ? 's' : ''}
                      </a>
                      {contributionStats.reviewCount > 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <a href={contributionStats.reviewSearchUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                            {contributionStats.reviewCount} review{contributionStats.reviewCount !== 1 ? 's' : ''}
                          </a>
                        </>
                      )}
                    </div>
                  </section>
                )}

                <Link
                  href="/projects"
                  className="group inline-flex items-center gap-2 self-start text-sm font-mono text-[var(--terminal-text-dim)] hover:text-primary transition-colors mt-2"
                >
                  <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  CD .. [ ALL_PROJECTS ]
                </Link>
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
