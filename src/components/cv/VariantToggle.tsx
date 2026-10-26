import { eventProps } from '@/lib/track';

export type CVVariant = 'ats' | 'designed';

interface VariantToggleProps {
  variant: CVVariant;
  onChange: (variant: CVVariant) => void;
}

const OPTIONS: { id: CVVariant; label: string; icon: string }[] = [
  { id: 'ats', label: 'ATS', icon: 'description' },
  { id: 'designed', label: 'DESIGNED', icon: 'palette' },
];

/** ATS: plain, for job portals. Designed: for sending to a person. */
export default function VariantToggle({ variant, onChange }: VariantToggleProps) {
  return (
    <div role="group" aria-label="CV variant" className="flex h-10 sm:h-12 overflow-hidden rounded border-2 border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)]">
      {OPTIONS.map(({ id, label, icon }) => {
        const active = variant === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            {...eventProps('cv_variant', { variant: id })}
            className={`flex cursor-pointer items-center justify-center gap-2 px-3 sm:px-4 font-mono text-xs sm:text-sm transition active:scale-[0.97] ${active
              ? 'bg-primary/10 text-primary'
              : 'text-[var(--terminal-text-muted)] hover:text-primary'
              }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base sm:text-lg">{icon}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
