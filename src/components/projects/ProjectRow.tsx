import type { Project } from '@/config';
import type { ContributionStats } from '@/lib/github-contributions';
import { getProjectHashId } from '@/lib/project-status';
import ProjectStatusBadges from './ProjectStatusBadges';
import ProjectActionButton from './ProjectActionButton';
import ProjectContributionSummary from './ProjectContributionSummary';

interface ProjectRowProps {
  project: Project;
  index: number;
  contributionStats?: Record<string, ContributionStats | null>;
}

export default function ProjectRow({ project, index, contributionStats = {} }: ProjectRowProps) {
  const hashId = getProjectHashId(project.id);

  return (
    <div
      className="animate-reveal group grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-3 sm:px-4 md:px-6 py-3 sm:py-4 border-b border-[var(--terminal-border-alt)] hover:bg-[var(--terminal-hover-overlay)] transition-colors items-center relative overflow-hidden last:border-b-0"
      style={{ animationDelay: `${Math.min(index, 8) * 100}ms` }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-primary transition-colors"></div>

      <div className="col-span-2 flex items-center gap-2 text-[var(--terminal-text-dim)] font-mono text-[10px] sm:text-xs md:text-sm">
        <span className="md:hidden text-[var(--terminal-text-dim)] mr-2">HASH:</span>
        <span>{hashId}</span>
        <span
          className={`inline-flex items-center justify-center ${project.visibility === 'public' ? 'text-green-400' : 'text-red-400'}`}
          title={project.visibility === 'public' ? 'Public' : 'Private'}
        >
          <span className="material-symbols-outlined text-sm sm:text-base">
            {project.visibility === 'public' ? 'public' : 'lock'}
          </span>
        </span>
      </div>

      <div className="col-span-4 flex items-center gap-2 sm:gap-3">
        <span className="material-symbols-outlined text-[var(--terminal-text-muted)] text-base sm:text-lg md:text-xl">{project.icon}</span>
        <div className="flex flex-col min-w-0">
          <span className="text-[var(--terminal-text)] font-bold text-base sm:text-lg tracking-tight group-hover:text-primary transition-colors break-words">{project.name}</span>
          <ProjectContributionSummary stats={contributionStats[project.id]} />
        </div>
      </div>

      <ProjectStatusBadges project={project} />

      <div className="col-span-2">
        <span className="md:hidden text-[var(--terminal-text-dim)] text-[10px] mr-2">TYPE:</span>
        <span className="text-[var(--terminal-text)] text-xs sm:text-sm font-mono uppercase">
          {project.category}
        </span>
      </div>

      <div className="col-span-2 flex justify-start md:justify-end">
        <ProjectActionButton project={project} />
      </div>
    </div>
  );
}
