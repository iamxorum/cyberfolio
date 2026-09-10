import Image from 'next/image';
import { languages } from '@/config';

export default function LanguagesSection() {
  if (languages.length === 0) return null;

  return (
    <div className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-3 sm:p-4 font-mono text-xs">
      <div className="flex justify-between items-center mb-2 sm:mb-3 border-b border-[var(--terminal-border)] pb-2">
        <span className="text-[var(--terminal-text-dim)] text-[10px] sm:text-xs">LANGUAGES</span>
      </div>
      <div className="space-y-2">
        {languages.map((lang) => (
          <div key={lang.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src={`https://flagcdn.com/w20/${lang.countryCode}.png`}
                  alt={`${lang.name} flag`}
                  width={20}
                  height={15}
                  style={{ width: '20px', height: '15px' }}
                  className="rounded-sm"
                  unoptimized
                />
                <span className="text-[var(--terminal-text-muted)] text-[10px] sm:text-xs">{lang.name}</span>
              </div>
              {lang.proficiency && (
                <span className="text-primary text-[9px] sm:text-[10px]">{lang.proficiency}</span>
              )}
            </div>
            {(lang.spoken || lang.written || lang.listening) && (
              <div className="flex flex-wrap items-center gap-2 text-[9px] sm:text-[10px] ml-7">
                {lang.spoken && (
                  <span className="text-[var(--terminal-text-dim)]">
                    <span className="text-[var(--terminal-text-muted)]">Spoken:</span> <span className="text-[var(--terminal-text)]">{lang.spoken}</span>
                  </span>
                )}
                {lang.written && (
                  <span className="text-[var(--terminal-text-dim)]">
                    <span className="text-[var(--terminal-text-muted)]">Written:</span> <span className="text-[var(--terminal-text)]">{lang.written}</span>
                  </span>
                )}
                {lang.listening && (
                  <span className="text-[var(--terminal-text-dim)]">
                    <span className="text-[var(--terminal-text-muted)]">Listening:</span> <span className="text-[var(--terminal-text)]">{lang.listening}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
