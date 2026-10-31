import { experience } from '@/config';
import { STAGGER_STEP_MS } from '@/lib/motion';
import Reveal from '@/components/Reveal';
import { formatDuration, formatTotalDuration, isOngoingEnd } from '@/lib/cv-helpers';
import ExperienceDescription from './ExperienceDescription';

function getDateRange(exp: (typeof experience)[number]): string {
  const isOngoing = isOngoingEnd(exp.endDate);
  if (isOngoing) return `${exp.startDate} - Present`;
  return exp.startDate === exp.endDate ? exp.startDate : `${exp.startDate} - ${exp.endDate}`;
}

export default function ExperienceTimeline() {
  if (experience.length === 0) return null;

  const totalDuration = formatTotalDuration(experience);

  return (
    <Reveal id="experience" draw className="border border-[var(--terminal-border)] rounded bg-[var(--terminal-bg)] p-4 scroll-mt-32">
      <h2 className="flex items-baseline justify-between gap-2 text-xs font-mono text-[var(--terminal-text-dim)] mb-3 pb-2 border-b border-[var(--terminal-border)]">
        <span>RECENT_ACTIVITY_LOG</span>
        {totalDuration && <span className="text-[var(--terminal-text-muted)]">{totalDuration} total</span>}
      </h2>
      <div className="space-y-3 font-mono text-sm">
        {[...experience].reverse().map((exp, index) => {
          const isOngoing = isOngoingEnd(exp.endDate);
          const dateRange = getDateRange(exp);
          const duration = formatDuration(exp.startDate, exp.endDate);

          return (
            <Reveal key={exp.id} className="flex flex-col sm:flex-row gap-1.5 sm:gap-3 items-start group" delay={Math.min(index, 2) * STAGGER_STEP_MS}>
              <div className="text-[var(--terminal-text-dim)] text-xs sm:w-36 sm:flex-shrink-0">
                <div>{dateRange}</div>
                {duration && <div className="mt-0.5 text-[var(--terminal-text-muted)]">{duration}</div>}
                {exp.type && (
                  <div className="mt-1 text-[var(--terminal-text-muted)]">
                    {exp.type}
                    {exp.type2 && <span className="ml-1.5">• {exp.type2}</span>}
                  </div>
                )}
              </div>
              <div className={`hidden sm:block w-px self-stretch relative transition-colors ${isOngoing ? 'bg-primary' : 'bg-[var(--terminal-border)] group-hover:bg-primary'}`}>
                <div className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-colors ${isOngoing ? 'bg-primary shadow-[0_0_4px_rgba(var(--terminal-accent-rgb),0.6)]' : 'bg-[var(--terminal-bg)] border border-[var(--terminal-border)] group-hover:border-primary group-hover:bg-primary'}`}></div>
              </div>
              <div className="w-full sm:flex-1 pb-2 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="text-[var(--terminal-text)] font-bold group-hover:text-primary transition-colors flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-2 min-w-0">
                    {exp.logo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={exp.logo} alt="" width={24} height={24} className="w-6 h-6 shrink-0 rounded-sm object-contain" />
                    )}
                    <span className="min-w-0">
                      {exp.role},{' '}
                      {exp.company}
                    </span>
                    </span>
                    {isOngoing && (
                      <span className="text-xs px-1.5 py-0.5 rounded border border-primary text-primary font-mono tracking-wider">CURRENT</span>
                    )}
                  </div>
                </div>
                <ExperienceDescription description={exp.description} />
                {exp.location && (
                  <div className="text-xs text-[var(--terminal-text-dim)] mb-2">{exp.location}</div>
                )}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {exp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 text-xs bg-[var(--terminal-surface-dark)] border border-[var(--terminal-border)] rounded text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary transition-colors"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </Reveal>
  );
}
