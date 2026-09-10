'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Terminal from '@/components/Terminal';
import InitScreen from '@/components/InitScreen';
import Link from 'next/link';
import { projects, contentConfig } from '@/config';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import ProjectsTable from '@/components/projects/ProjectsTable';
import type { ContributionStats } from '@/lib/github-contributions';

interface ProjectsClientProps {
  contributionStats?: Record<string, ContributionStats | null>;
}

export default function ProjectsClient({ contributionStats = {} }: ProjectsClientProps) {
  const { initialized, setInitialized } = useAppInitialization();
  const personalProjects = projects.filter((p) => p.projectType === 'personal');
  const contributionProjects = projects.filter((p) => p.projectType === 'contribution');

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-hidden font-display">
      {!initialized && <InitScreen onInit={() => setInitialized(true)} />}
      {/* Background Grid Pattern Effect */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 relative z-10">
          <div className="layout-content-container flex flex-col max-w-[960px] w-full flex-1">
            <main id="main-content" tabIndex={-1}>
              <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm font-mono tracking-wide">
                  <span className="material-symbols-outlined text-[var(--terminal-text-dim)] text-lg">folder_open</span>
                  <Link href="/" className="text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors">~/root</Link>
                  <span className="text-[var(--terminal-text-dim)]">/</span>
                  <Link href="/projects" className="text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors">projects.yaml</Link>
                  <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
                </div>
                {/* Page Heading & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 border-b border-[var(--terminal-border-alt)] pb-4 sm:pb-6">
                  <div className="flex flex-col gap-1 sm:gap-2">
                    <h1 className="animate-reveal text-[var(--terminal-text)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight uppercase">
                      {contentConfig.projects.title}
                    </h1>
                    <p className="animate-reveal text-[var(--terminal-text-muted)] text-sm sm:text-base md:text-lg font-mono" style={{ animationDelay: '130ms' }}>
                      {contentConfig.projects.subtitle}
                    </p>
                  </div>
                  <Link href="/" className="group flex items-center justify-center gap-2 rounded h-9 sm:h-10 px-3 sm:px-5 bg-[var(--terminal-border-alt)] hover:bg-[var(--terminal-border)] transition-all text-[var(--terminal-text)] text-xs sm:text-sm font-bold tracking-wide border border-transparent hover:border-[var(--terminal-text-dim)]">
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <span className="hidden sm:inline">CD .. [ RETURN_HOME ]</span>
                    <span className="sm:hidden">HOME</span>
                  </Link>
                </div>
                {/* Projects Section */}
                <div className="flex flex-col gap-6 sm:gap-8">
                  <ProjectsTable title="Projects" icon="folder" projects={personalProjects} contributionStats={contributionStats} />
                  {contributionProjects.length > 0 && (
                    <ProjectsTable title="Contributions" icon="group" projects={contributionProjects} contributionStats={contributionStats} />
                  )}
                </div>
                {/* Interactive Terminal */}
                <Terminal />
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
