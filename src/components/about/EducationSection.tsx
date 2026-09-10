import { education } from '@/config';

type Education = (typeof education)[number];

function EducationBadge({ edu }: { edu: Education }) {
  const isOngoing = !edu.endDate || edu.endDate.toLowerCase() === 'ongoing';
  const hasGrade = edu.grade && edu.grade.trim() !== '';

  if (hasGrade) {
    return (
      <>
        <span>•</span>
        <span className="text-primary">Grade: {edu.grade}</span>
      </>
    );
  }

  if (!isOngoing) {
    return (
      <>
        <span>•</span>
        <span className="text-red-400">[ABANDONED]</span>
      </>
    );
  }

  return null;
}

export default function EducationSection() {
  if (education.length === 0) return null;

  return (
    <div id="education" className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-4 sm:p-6 scroll-mt-20">
      <h2 className="text-[var(--terminal-text)] font-mono text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-lg sm:text-xl">school</span>
        <span className="text-sm sm:text-base">EDUCATION</span>
      </h2>
      <div className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary/50 transition-colors group">
            {edu.icon && (
              <span className="material-symbols-outlined text-primary text-xl sm:text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                {edu.icon}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-mono text-[var(--terminal-text)] font-bold mb-1 group-hover:text-primary transition-colors">
                {edu.degree}
                {edu.field && <span className="text-[var(--terminal-text-muted)]"> - {edu.field}</span>}
              </h3>
              <p className="text-xs sm:text-sm font-mono text-primary mb-1">{edu.institution}</p>
              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-mono text-[var(--terminal-text-muted)]">
                <span>{edu.startDate}</span>
                {edu.endDate && edu.endDate.toLowerCase() !== 'ongoing' && (
                  <>
                    <span>-</span>
                    <span>{edu.endDate}</span>
                  </>
                )}
                {edu.endDate && edu.endDate.toLowerCase() === 'ongoing' && (
                  <span className="text-green-400">[ONGOING]</span>
                )}
                {!edu.endDate && <span className="text-green-400">[ONGOING]</span>}
                {edu.location && (
                  <>
                    <span>•</span>
                    <span>{edu.location}</span>
                  </>
                )}
                <EducationBadge edu={edu} />
              </div>
              {edu.description && (
                <p className="text-[10px] sm:text-xs font-mono text-[var(--terminal-text-muted)] mt-2 leading-relaxed">
                  {edu.description}
                </p>
              )}

              {edu.thesisUrl && (
                <div className="mt-3">
                  <a
                    href={edu.thesisUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[var(--terminal-border)] hover:border-primary hover:bg-primary/10 text-[var(--terminal-text)] text-[10px] sm:text-xs font-bold font-mono tracking-wider transition-all group/btn w-fit"
                  >
                    <span className="material-symbols-outlined text-sm sm:text-base group-hover/btn:text-primary">
                      description
                    </span>
                    <span>{edu.thesisLabel || 'VIEW_DOC'}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
