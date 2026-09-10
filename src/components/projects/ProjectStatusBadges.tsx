import { getStatusColorStyles } from '@/lib/project-status';
import type { Project } from '@/config';

export default function ProjectStatusBadges({ project }: { project: Project }) {
  const statuses = Array.isArray(project.status) ? project.status : [project.status];
  const statusColors = Array.isArray(project.statusColor) ? project.statusColor : [project.statusColor];

  return (
    <div className="col-span-2 flex flex-wrap items-center gap-1.5">
      <span className="md:hidden text-[var(--terminal-text-dim)] text-[10px]">STATUS:</span>
      {statuses.map((status, idx) => {
        const styles = getStatusColorStyles(statusColors[idx] || statusColors[0]);
        return (
          <span key={idx} className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${styles.bg} border ${styles.border} ${styles.text} text-[10px] sm:text-xs font-bold font-mono`}>
            <span className={`size-1 sm:size-1.5 rounded-full ${styles.dot}`}></span>
            <span className="hidden sm:inline">{status}</span>
            <span className="sm:hidden truncate max-w-[60px]">{status.split('_')[0]}</span>
          </span>
        );
      })}
    </div>
  );
}
