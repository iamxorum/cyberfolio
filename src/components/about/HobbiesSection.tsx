import { hobbies, isPersonalHobby } from '@/config';
import Reveal from '@/components/Reveal';
import TypedText from '@/components/TypedText';
import { STAGGER_STEP_DENSE_MS, revealDelay } from '@/lib/motion';

const VARIANTS = {
  professional: { id: 'interests', title: 'INTERESTS', icon: 'psychology' },
  personal: { id: 'off-duty', title: 'OFF_DUTY', icon: 'favorite' },
} as const;

interface HobbiesSectionProps {
  kind: keyof typeof VARIANTS;
  /** Sidebar card styling (matches Skills / Languages) instead of the wide two-column grid. */
  compact?: boolean;
}

export default function HobbiesSection({ kind, compact = false }: HobbiesSectionProps) {
  const { id, title, icon } = VARIANTS[kind];
  const items = hobbies.filter((hobby) => isPersonalHobby(hobby) === (kind === 'personal'));
  if (items.length === 0) return null;

  if (compact) {
    return (
      <Reveal id={id} draw className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-3 sm:p-4 font-mono text-xs scroll-mt-32">
        <div className="flex justify-between items-center mb-2 sm:mb-3 border-b border-[var(--terminal-border)] pb-2">
          <span className="text-[var(--terminal-text-dim)] text-[10px] sm:text-xs">{title}</span>
        </div>
        <ul className="space-y-2.5">
          {items.map((hobby) => (
            <li key={hobby.name} className="flex items-start gap-2 group">
              {hobby.icon && (
                <span className="material-symbols-outlined text-primary text-base flex-shrink-0 group-hover:scale-110 transition-transform">
                  {hobby.icon}
                </span>
              )}
              <div className="min-w-0">
                <div className="text-[var(--terminal-text-muted)] text-[10px] sm:text-xs group-hover:text-primary transition-colors">
                  {hobby.name}
                </div>
                {hobby.description && (
                  <p className="text-[var(--terminal-text-dim)] text-[9px] sm:text-[10px] leading-relaxed mt-0.5">
                    {hobby.description}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    );
  }

  return (
    <Reveal id={id} draw className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-4 sm:p-6 matrix-bg scroll-mt-32">
      <h2 className="text-[var(--terminal-text)] font-mono text-base sm:text-lg font-bold mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-[var(--terminal-border)] flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-lg sm:text-xl">{icon}</span>
        <span className="text-sm sm:text-base"><TypedText text={title} /></span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {items.map((hobby, index) => (
          <div key={hobby.name} data-reveal style={revealDelay(Math.min(index, 5) * STAGGER_STEP_DENSE_MS)} className="scroll-reveal flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary/50 transition-colors group">
            {hobby.icon && (
              <span className="material-symbols-outlined text-primary text-lg sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                {hobby.icon}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-mono text-[var(--terminal-text)] font-bold mb-1 group-hover:text-primary transition-colors">
                {hobby.name}
              </h3>
              {hobby.description && (
                <p className="text-[10px] sm:text-xs font-mono text-[var(--terminal-text-muted)] leading-relaxed">
                  {hobby.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}
