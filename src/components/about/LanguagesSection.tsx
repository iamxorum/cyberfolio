import Image from 'next/image';
import { languages } from '@/config';
import Reveal from '@/components/Reveal';

interface LevelChipProps {
  icon: string;
  skill: string;
  level: string;
}

/** Icon plus level. The skill name shows on hover, keyboard focus and tap, and is the accessible name. */
function LevelChip({ icon, skill, level }: LevelChipProps) {
  return (
    <span
      tabIndex={0}
      aria-label={`${skill}: ${level}`}
      className="group relative inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-[var(--terminal-text)] outline-none focus-visible:ring-1 focus-visible:ring-primary"
    >
      <span aria-hidden="true" className="material-symbols-outlined text-sm text-[var(--terminal-text-dim)] group-hover:text-primary group-focus:text-primary">{icon}</span>
      <span aria-hidden="true">{level}</span>
      <span
        role="tooltip"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 hidden whitespace-nowrap rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] px-1.5 py-0.5 text-[var(--terminal-text-muted)] group-hover:block group-focus:block"
      >
        {skill}
      </span>
    </span>
  );
}

export default function LanguagesSection() {
  if (languages.length === 0) return null;

  return (
    <Reveal draw className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-3 sm:p-4 font-mono text-xs">
      <div className="flex justify-between items-center mb-2 sm:mb-3 border-b border-[var(--terminal-border)] pb-2">
        <span className="text-[var(--terminal-text-dim)] text-xs sm:text-xs">LANGUAGES</span>
      </div>
      <div className="space-y-2.5">
        {languages.map((lang) => (
          <div key={lang.id} className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Image
                  src={`https://flagcdn.com/w20/${lang.countryCode}.png`}
                  alt=""
                  width={20}
                  height={15}
                  style={{ width: '20px', height: '15px' }}
                  className="rounded-sm object-contain"
                  unoptimized
                />
                <span className="text-[var(--terminal-text-muted)] text-xs sm:text-xs">{lang.name}</span>
              </div>
              {lang.proficiency && (
                <span className="text-primary text-xs sm:text-xs">{lang.proficiency}</span>
              )}
            </div>
            {(lang.spoken || lang.written || lang.listening) && (
              <div className="ml-7 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                {lang.spoken && <LevelChip icon="record_voice_over" skill="Spoken" level={lang.spoken} />}
                {lang.written && <LevelChip icon="edit" skill="Written" level={lang.written} />}
                {lang.listening && <LevelChip icon="hearing" skill="Listening" level={lang.listening} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </Reveal>
  );
}
