import type { Project } from '@/config';

export default function ProjectActionButton({ project }: { project: Project }) {
  if (project.repository && project.visibility === 'public') {
    return (
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
    );
  }

  if (project.visibility === 'private') {
    return (
      <div className="h-7 sm:h-8 px-2 sm:px-3 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] text-[10px] sm:text-xs font-bold font-mono tracking-wider flex items-center gap-1 sm:gap-2 cursor-not-allowed opacity-50">
        <span className="material-symbols-outlined text-sm sm:text-[16px]">lock</span>
        <span className="hidden sm:inline">LOCKED</span>
        <span className="sm:hidden">LOCK</span>
      </div>
    );
  }

  return (
    <span className="h-7 sm:h-8 px-2 sm:px-3 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] text-[10px] sm:text-xs font-bold font-mono tracking-wider flex items-center gap-1 sm:gap-2 cursor-not-allowed">
      <span className="hidden sm:inline">NO_REPO</span>
      <span className="sm:hidden">N/A</span>
    </span>
  );
}
