'use client';
import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { projects } from '@/config';

export default function ProjectsGrid() {
  const projectsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (projectsRef.current) {
      const elements = projectsRef.current.querySelectorAll('div[class*="flex flex-1"]');
      animate(Array.from(elements), {
        opacity: [0, 0.7, 1],
        scale: [0.98, 1],
        delay: stagger(250),
        duration: 700,
        easing: 'easeOutQuad',
      });
    }
  }, []);

  if (projects.length === 0) return null;

  return (
    <>
      <div className="px-2 sm:px-4 pt-4 sm:pt-5 pb-2">
        <div className="flex items-center gap-2 text-[var(--terminal-text-muted)] font-mono text-xs sm:text-sm mb-2">
          <span>~/workspace</span>
          <span>/</span>
          <span className="text-[var(--terminal-text)]">active-projects</span>
        </div>
        <h2 className="text-[var(--terminal-text)] text-xl sm:text-2xl md:text-[28px] font-bold leading-tight tracking-[-0.015em] border-b border-[var(--terminal-border)] pb-3 sm:pb-4 flex items-center gap-2 sm:gap-3">
          <span className="text-primary">&gt;</span> ./run_projects.sh
        </h2>
      </div>
      <div className="flex flex-col gap-6 sm:gap-10 px-2 sm:px-4 py-4 sm:py-6 @container" ref={projectsRef}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-0">
          {projects.map((project) => {
            const statusColorMap = {
              green: 'text-green-400',
              yellow: 'text-yellow-400',
              blue: 'text-blue-400',
              orange: 'text-orange-400',
              red: 'text-red-400',
            };

            const statuses = Array.isArray(project.status) ? project.status : [project.status];
            const statusColors = Array.isArray(project.statusColor) ? project.statusColor : [project.statusColor];

            return (
              <div
                key={project.id}
                className={`flex flex-1 gap-3 sm:gap-4 rounded border-2 border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] p-4 sm:p-5 flex-col transition-all duration-300 group relative ${project.visibility === 'public' && project.link
                  ? 'hover:bg-[var(--terminal-surface-hover)] hover:border-primary hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(var(--terminal-accent-rgb),0.3)] cursor-pointer'
                  : 'opacity-75 cursor-not-allowed border-dashed'
                  }`}
                onClick={() => project.visibility === 'public' && project.link && window.open(project.link, '_blank')}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded pointer-events-none"></div>
                <div className="absolute left-0 top-1/4 h-1/2 w-[2px] bg-primary opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-[0_0_10px_rgba(var(--terminal-accent-rgb),1)]"></div>

                {project.visibility === 'public' && project.link && (
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="material-symbols-outlined text-primary">arrow_outward</span>
                  </div>
                )}
                {project.visibility === 'private' && (
                  <div className="absolute top-3 right-3">
                    <span className="material-symbols-outlined text-red-400 text-lg">lock</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-primary/20 text-primary border border-primary/20">
                    <span className="material-symbols-outlined text-[28px]">{project.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[var(--terminal-text)] text-lg font-bold leading-tight font-mono">{project.name}</h2>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {statuses.map((status, idx) => {
                        const color = statusColors[idx] || statusColors[0] || 'green';
                        return (
                          <span key={idx} className={`text-xs ${statusColorMap[color]} font-mono`}>
                            {status}
                            {idx < statuses.length - 1 && <span className="text-[var(--terminal-text-dim)] mx-1">•</span>}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <p className="text-[var(--terminal-text-muted)] text-sm font-mono leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 rounded bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[10px] text-[var(--terminal-text-dim)] font-mono whitespace-nowrap">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
