import { experience } from '@/config';

function getDateRange(exp: (typeof experience)[number]): string {
  const isOngoing = !exp.endDate || exp.endDate.toLowerCase() === 'ongoing';
  if (isOngoing) return `${exp.startDate} - Present`;
  return exp.startDate === exp.endDate ? exp.startDate : `${exp.startDate} - ${exp.endDate}`;
}

export default function ExperienceTimeline() {
  if (experience.length === 0) return null;

  return (
    <div id="experience" className="border border-[var(--terminal-border)] rounded bg-[var(--terminal-bg)] p-4 scroll-mt-20">
      <h2 className="text-xs font-mono text-[var(--terminal-text-dim)] mb-3">RECENT_ACTIVITY_LOG</h2>
      <div className="space-y-3 font-mono text-sm">
        {[...experience].reverse().map((exp, index) => {
          const isOngoing = !exp.endDate || exp.endDate.toLowerCase() === 'ongoing';
          const dateRange = getDateRange(exp);

          return (
            <div key={exp.id} className="animate-reveal flex gap-3 items-start group" style={{ animationDelay: `${Math.min(index, 6) * 120}ms` }}>
              <div className="text-[var(--terminal-text-dim)] text-xs w-36 flex-shrink-0">
                <div>{dateRange}</div>
                {exp.type && (
                  <div className="mt-1 text-[var(--terminal-text-muted)]">
                    {exp.type}
                    {exp.type2 && <span className="ml-1.5">• {exp.type2}</span>}
                  </div>
                )}
              </div>
              <div className={`w-px self-stretch relative transition-colors ${isOngoing ? 'bg-primary' : 'bg-[var(--terminal-border)] group-hover:bg-primary'}`}>
                <div className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-colors ${isOngoing ? 'bg-primary shadow-[0_0_4px_rgba(var(--terminal-accent-rgb),0.6)]' : 'bg-[var(--terminal-bg)] border border-[var(--terminal-border)] group-hover:border-primary group-hover:bg-primary'}`}></div>
              </div>
              <div className="flex-1 pb-2 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="text-[var(--terminal-text)] font-bold group-hover:text-primary transition-colors flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                    {exp.role}, {exp.company}
                    {isOngoing && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-primary text-primary font-mono tracking-wider">CURRENT</span>
                    )}
                  </div>
                </div>
                {exp.description && (
                  <div className="text-xs text-[var(--terminal-text-muted)] mb-1">{exp.description}</div>
                )}
                {exp.location && (
                  <div className="text-xs text-[var(--terminal-text-dim)] mb-2">{exp.location}</div>
                )}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {exp.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-xs bg-[var(--terminal-surface-dark)] border border-[var(--terminal-border)] rounded text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
