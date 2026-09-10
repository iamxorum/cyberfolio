import type { Project } from '@/config';
import type { ContributionStats } from '@/lib/github-contributions';
import ProjectRow from './ProjectRow';

interface ProjectsTableProps {
  title: string;
  icon: string;
  projects: Project[];
  contributionStats?: Record<string, ContributionStats | null>;
}

export default function ProjectsTable({ title, icon, projects, contributionStats = {} }: ProjectsTableProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 border-b border-[var(--terminal-border-alt)] pb-3">
        <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl">{icon}</span>
        <h2 className="text-[var(--terminal-text)] text-xl sm:text-2xl md:text-3xl font-bold tracking-tight uppercase">
          {title}
        </h2>
        <span className="text-[var(--terminal-text-dim)] text-xs sm:text-sm font-mono">
          ({projects.length})
        </span>
      </div>
      <div className="flex flex-col rounded-lg border border-[var(--terminal-border)] bg-[var(--terminal-surface-table)] overflow-hidden shadow-2xl shadow-black/50">
        <div className="hidden md:grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-2 md:py-3 bg-[var(--terminal-surface-table-header)] border-b border-[var(--terminal-border)] text-[var(--terminal-text-dim)] text-[10px] md:text-xs font-bold tracking-widest uppercase">
          <div className="col-span-2">FILE_HASH</div>
          <div className="col-span-4">PROJECT_NAME</div>
          <div className="col-span-2">STATUS_LOG</div>
          <div className="col-span-2">TYPE_TAG</div>
          <div className="col-span-2 text-right">ACTION</div>
        </div>
        {projects.map((project, index) => (
          <ProjectRow key={project.id} project={project} index={index} contributionStats={contributionStats} />
        ))}
      </div>
    </div>
  );
}
