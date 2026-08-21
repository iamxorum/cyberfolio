'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Terminal from '@/components/Terminal';
import InitScreen from '@/components/InitScreen';
import Link from 'next/link';
import { projects, contentConfig } from '@/config';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import type { ContributionStats } from '@/lib/github-contributions';

interface ProjectsClientProps {
  contributionStats?: Record<string, ContributionStats | null>;
}

export default function ProjectsClient({ contributionStats = {} }: ProjectsClientProps) {
  const { initialized, setInitialized } = useAppInitialization();

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
                {/* Personal Projects Section */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 border-b border-[var(--terminal-border-alt)] pb-3">
                    <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">folder</span>
                    <h2 className="text-[var(--terminal-text)] text-xl sm:text-2xl md:text-3xl font-bold tracking-tight uppercase">
                      Projects
                    </h2>
                    <span className="text-[var(--terminal-text-dim)] text-xs sm:text-sm font-mono">
                      ({projects.filter(p => p.projectType === 'personal').length})
                    </span>
                  </div>
                  <div className="flex flex-col rounded-lg border border-[var(--terminal-border)] bg-[var(--terminal-surface-table)] overflow-hidden shadow-2xl shadow-black/50">
                    {/* Header Row */}
                    <div className="hidden md:grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-2 md:py-3 bg-[var(--terminal-surface-table-header)] border-b border-[var(--terminal-border)] text-[var(--terminal-text-dim)] text-[10px] md:text-xs font-bold tracking-widest uppercase">
                      <div className="col-span-2">FILE_HASH</div>
                      <div className="col-span-4">PROJECT_NAME</div>
                      <div className="col-span-2">STATUS_LOG</div>
                      <div className="col-span-2">TYPE_TAG</div>
                      <div className="col-span-2 text-right">ACTION</div>
                    </div>
                    {/* Personal Project Rows */}
                    {projects.filter(p => p.projectType === 'personal').map((project, index) => {
                  
                  const hashId = `0x${project.id.slice(0, 6).toUpperCase().padEnd(6, '0')}`;
                  
                  
                  const statusColorMap = {
                    green: {
                      bg: 'bg-green-500/10',
                      border: 'border-green-500/20',
                      text: 'text-green-400',
                      dot: 'bg-green-400',
                    },
                    yellow: {
                      bg: 'bg-yellow-500/10',
                      border: 'border-yellow-500/20',
                      text: 'text-yellow-400',
                      dot: 'bg-yellow-400',
                    },
                    blue: {
                      bg: 'bg-blue-500/10',
                      border: 'border-blue-500/20',
                      text: 'text-blue-400',
                      dot: 'bg-blue-400',
                    },
                    orange: {
                      bg: 'bg-orange-500/10',
                      border: 'border-orange-500/20',
                      text: 'text-orange-400',
                      dot: 'bg-orange-400',
                    },
                    red: {
                      bg: 'bg-red-500/10',
                      border: 'border-red-500/20',
                      text: 'text-red-400',
                      dot: 'bg-red-400',
                    },
                  };
                  
                  
                  const statuses = Array.isArray(project.status) ? project.status : [project.status];
                  const statusColors = Array.isArray(project.statusColor) ? project.statusColor : [project.statusColor];
                  
                  return (
                    <div
                      key={project.id}
                      className="animate-reveal group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-[var(--terminal-border-alt)] hover:bg-[var(--terminal-hover-overlay)] transition-colors items-center relative overflow-hidden last:border-b-0"
                      style={{ animationDelay: `${Math.min(index, 8) * 100}ms` }}
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-primary transition-colors"></div>
                      <div className="col-span-2 flex items-center gap-2 text-[var(--terminal-text-dim)] font-mono text-[10px] sm:text-xs md:text-sm">
                        <span className="md:hidden text-[var(--terminal-text-dim)] mr-2">HASH:</span>
                        <span>{hashId}</span>
                        <span className={`inline-flex items-center justify-center ${
                          project.visibility === 'public' 
                            ? 'text-green-400' 
                            : 'text-red-400'
                        }`} title={project.visibility === 'public' ? 'Public' : 'Private'}>
                          <span className="material-symbols-outlined text-sm sm:text-base">
                            {project.visibility === 'public' ? 'public' : 'lock'}
                          </span>
                        </span>
                      </div>
                      <div className="col-span-4 flex items-center gap-2 sm:gap-3">
                        <span className="material-symbols-outlined text-[var(--terminal-text-muted)] text-base sm:text-lg md:text-xl">{project.icon}</span>
                        <span className="text-[var(--terminal-text)] font-bold text-base sm:text-lg tracking-tight group-hover:text-primary transition-colors break-words">{project.name}</span>
                      </div>
                      <div className="col-span-2 flex flex-wrap items-center gap-1.5">
                        <span className="md:hidden text-[var(--terminal-text-dim)] text-[10px]">STATUS:</span>
                        {statuses.map((status, idx) => {
                          const color = statusColors[idx] || statusColors[0] || 'green';
                          const statusColorStyles = statusColorMap[color] || statusColorMap.green;
                          return (
                            <span key={idx} className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${statusColorStyles.bg} border ${statusColorStyles.border} ${statusColorStyles.text} text-[10px] sm:text-xs font-bold font-mono`}>
                              <span className={`size-1 sm:size-1.5 rounded-full ${statusColorStyles.dot}`}></span>
                              <span className="hidden sm:inline">{status}</span>
                              <span className="sm:hidden truncate max-w-[60px]">{status.split('_')[0]}</span>
                            </span>
                          );
                        })}
                      </div>
                      <div className="col-span-2">
                        <span className="md:hidden text-[var(--terminal-text-dim)] text-[10px] mr-2">TYPE:</span>
                        <span className="text-[var(--terminal-text)] text-xs sm:text-sm font-mono uppercase">
                          {project.category}
                        </span>
                      </div>
                      <div className="col-span-2 flex justify-start md:justify-end">
                        {project.repository && project.visibility === 'public' ? (
                          <a
                            href={project.repository}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-7 sm:h-8 px-2 sm:px-3 rounded border border-[var(--terminal-border)] hover:border-primary hover:bg-primary/20 text-[var(--terminal-text)] text-[10px] sm:text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-1 sm:gap-2"
                          >
                            <span className="hidden sm:inline">VIEW_SOURCE</span>
                            <span className="sm:hidden">SOURCE</span>
                            <span className="material-symbols-outlined text-sm sm:text-[16px]">code</span>
                          </a>
                        ) : project.visibility === 'private' ? (
                          <div className="h-7 sm:h-8 px-2 sm:px-3 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] text-[10px] sm:text-xs font-bold font-mono tracking-wider flex items-center gap-1 sm:gap-2 cursor-not-allowed opacity-50">
                            <span className="material-symbols-outlined text-sm sm:text-[16px]">lock</span>
                            <span className="hidden sm:inline">LOCKED</span>
                            <span className="sm:hidden">LOCK</span>
                          </div>
                        ) : (
                          <span className="h-7 sm:h-8 px-2 sm:px-3 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] text-[10px] sm:text-xs font-bold font-mono tracking-wider flex items-center gap-1 sm:gap-2 cursor-not-allowed">
                            <span className="hidden sm:inline">NO_REPO</span>
                            <span className="sm:hidden">N/A</span>
                          </span>
                        )}
                      </div>
                    </div>
                    );
                    })}
                  </div>
                </div>

                {/* Contributions Section */}
                {projects.filter(p => p.projectType === 'contribution').length > 0 && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 border-b border-[var(--terminal-border-alt)] pb-3">
                      <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">group</span>
                      <h2 className="text-[var(--terminal-text)] text-xl sm:text-2xl md:text-3xl font-bold tracking-tight uppercase">
                        Contributions
                      </h2>
                      <span className="text-[var(--terminal-text-dim)] text-xs sm:text-sm font-mono">
                        ({projects.filter(p => p.projectType === 'contribution').length})
                      </span>
                    </div>
                    <div className="flex flex-col rounded-lg border border-[var(--terminal-border)] bg-[var(--terminal-surface-table)] overflow-hidden shadow-2xl shadow-black/50">
                      {/* Header Row */}
                      <div className="hidden md:grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-2 md:py-3 bg-[var(--terminal-surface-table-header)] border-b border-[var(--terminal-border)] text-[var(--terminal-text-dim)] text-[10px] md:text-xs font-bold tracking-widest uppercase">
                        <div className="col-span-2">FILE_HASH</div>
                        <div className="col-span-4">PROJECT_NAME</div>
                        <div className="col-span-2">STATUS_LOG</div>
                        <div className="col-span-2">TYPE_TAG</div>
                        <div className="col-span-2 text-right">ACTION</div>
                      </div>
                      {/* Contribution Project Rows */}
                      {projects.filter(p => p.projectType === 'contribution').map((project, index) => {
                        const hashId = `0x${project.id.slice(0, 6).toUpperCase().padEnd(6, '0')}`;
                        
                        const statusColorMap = {
                          green: {
                            bg: 'bg-green-500/10',
                            border: 'border-green-500/20',
                            text: 'text-green-400',
                            dot: 'bg-green-400',
                          },
                          yellow: {
                            bg: 'bg-yellow-500/10',
                            border: 'border-yellow-500/20',
                            text: 'text-yellow-400',
                            dot: 'bg-yellow-400',
                          },
                          blue: {
                            bg: 'bg-blue-500/10',
                            border: 'border-blue-500/20',
                            text: 'text-blue-400',
                            dot: 'bg-blue-400',
                          },
                          orange: {
                            bg: 'bg-orange-500/10',
                            border: 'border-orange-500/20',
                            text: 'text-orange-400',
                            dot: 'bg-orange-400',
                          },
                          red: {
                            bg: 'bg-red-500/10',
                            border: 'border-red-500/20',
                            text: 'text-red-400',
                            dot: 'bg-red-400',
                          },
                        };
                        
                        const statuses = Array.isArray(project.status) ? project.status : [project.status];
                        const statusColors = Array.isArray(project.statusColor) ? project.statusColor : [project.statusColor];
                        
                        return (
                          <div
                            key={project.id}
                            className="animate-reveal group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-[var(--terminal-border-alt)] hover:bg-[var(--terminal-hover-overlay)] transition-colors items-center relative overflow-hidden last:border-b-0"
                            style={{ animationDelay: `${Math.min(index, 8) * 100}ms` }}
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-primary transition-colors"></div>
                            <div className="col-span-2 flex items-center gap-2 text-[var(--terminal-text-dim)] font-mono text-[10px] sm:text-xs md:text-sm">
                              <span className="md:hidden text-[var(--terminal-text-dim)] mr-2">HASH:</span>
                              <span>{hashId}</span>
                              <span className={`inline-flex items-center justify-center ${
                                project.visibility === 'public' 
                                  ? 'text-green-400' 
                                  : 'text-red-400'
                              }`} title={project.visibility === 'public' ? 'Public' : 'Private'}>
                                <span className="material-symbols-outlined text-sm sm:text-base">
                                  {project.visibility === 'public' ? 'public' : 'lock'}
                                </span>
                              </span>
                            </div>
                            <div className="col-span-4 flex items-center gap-2 sm:gap-3">
                              <span className="material-symbols-outlined text-[var(--terminal-text-muted)] text-base sm:text-lg md:text-xl">{project.icon}</span>
                              <div className="flex flex-col min-w-0">
                                <span className="text-[var(--terminal-text)] font-bold text-base sm:text-lg tracking-tight group-hover:text-primary transition-colors break-words">{project.name}</span>
                                {contributionStats[project.id] && contributionStats[project.id]!.mergedCount > 0 && (
                                  <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-[var(--terminal-text-dim)] truncate">
                                    <a
                                      href={contributionStats[project.id]!.searchUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:text-primary transition-colors"
                                    >
                                      {contributionStats[project.id]!.mergedCount} merged PR{contributionStats[project.id]!.mergedCount !== 1 ? 's' : ''}
                                    </a>
                                    {contributionStats[project.id]!.reviewCount > 0 && (
                                      <>
                                        <span aria-hidden="true">·</span>
                                        <a
                                          href={contributionStats[project.id]!.reviewSearchUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="hover:text-primary transition-colors"
                                        >
                                          {contributionStats[project.id]!.reviewCount} review{contributionStats[project.id]!.reviewCount !== 1 ? 's' : ''}
                                        </a>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="col-span-2 flex flex-wrap items-center gap-1.5">
                              <span className="md:hidden text-[var(--terminal-text-dim)] text-[10px]">STATUS:</span>
                              {statuses.map((status, idx) => {
                                const color = statusColors[idx] || statusColors[0] || 'green';
                                const statusColorStyles = statusColorMap[color] || statusColorMap.green;
                                return (
                                  <span key={idx} className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${statusColorStyles.bg} border ${statusColorStyles.border} ${statusColorStyles.text} text-[10px] sm:text-xs font-bold font-mono`}>
                                    <span className={`size-1 sm:size-1.5 rounded-full ${statusColorStyles.dot}`}></span>
                                    <span className="hidden sm:inline">{status}</span>
                                    <span className="sm:hidden truncate max-w-[60px]">{status.split('_')[0]}</span>
                                  </span>
                                );
                              })}
                            </div>
                            <div className="col-span-2">
                              <span className="md:hidden text-[var(--terminal-text-dim)] text-[10px] mr-2">TYPE:</span>
                              <span className="text-[var(--terminal-text)] text-xs sm:text-sm font-mono uppercase">
                                {project.category}
                              </span>
                            </div>
                            <div className="col-span-2 flex justify-start md:justify-end">
                              {project.repository && project.visibility === 'public' ? (
                                <a
                                  href={project.repository}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="h-7 sm:h-8 px-2 sm:px-3 rounded border border-[var(--terminal-border)] hover:border-primary hover:bg-primary/20 text-[var(--terminal-text)] text-[10px] sm:text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-1 sm:gap-2"
                                >
                                  <span className="hidden sm:inline">VIEW_SOURCE</span>
                                  <span className="sm:hidden">SOURCE</span>
                                  <span className="material-symbols-outlined text-sm sm:text-[16px]">code</span>
                                </a>
                              ) : project.visibility === 'private' ? (
                                <div className="h-7 sm:h-8 px-2 sm:px-3 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] text-[10px] sm:text-xs font-bold font-mono tracking-wider flex items-center gap-1 sm:gap-2 cursor-not-allowed opacity-50">
                                  <span className="material-symbols-outlined text-sm sm:text-[16px]">lock</span>
                                  <span className="hidden sm:inline">LOCKED</span>
                                  <span className="sm:hidden">LOCK</span>
                                </div>
                              ) : (
                                <span className="h-7 sm:h-8 px-2 sm:px-3 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] text-[10px] sm:text-xs font-bold font-mono tracking-wider flex items-center gap-1 sm:gap-2 cursor-not-allowed">
                                  <span className="hidden sm:inline">NO_REPO</span>
                                  <span className="sm:hidden">N/A</span>
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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

