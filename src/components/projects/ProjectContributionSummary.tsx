import type { ContributionStats } from '@/lib/github-contributions';

export default function ProjectContributionSummary({ stats }: { stats?: ContributionStats | null }) {
  if (!stats || stats.mergedCount <= 0) return null;

  return (
    <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono text-[var(--terminal-text-dim)] truncate">
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
  );
}
