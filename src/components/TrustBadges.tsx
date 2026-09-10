import Image from 'next/image';
import { badges } from '@/config';

export default function TrustBadges() {
  if (badges.length === 0) return null;

  return (
    <div className="mt-6 z-10">
      <div className="flex items-center gap-2 text-[var(--terminal-text-dim)] font-mono text-[10px] sm:text-xs mb-2.5">
        <span>~/security</span>
        <span>/</span>
        <span className="text-[var(--terminal-text)]">verified-credentials</span>
      </div>
      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        {badges.map((badge) => {
          const accent = badge.accent ? `#${badge.accent}` : 'var(--terminal-accent)';
          const isInternal = badge.url.startsWith('#') || badge.url.startsWith('/#');
          return (
            <a
              key={badge.id}
              href={badge.url}
              {...(!isInternal && { target: '_blank', rel: 'noopener noreferrer' })}
              className={`group/badge relative flex items-center gap-2.5 rounded border border-[var(--terminal-border)] px-3 py-2 overflow-hidden transition-all hover:-translate-y-[2px] active:scale-[0.98] ${badge.containerClasses || 'bg-[var(--terminal-surface)]'}`}
              style={{ '--badge-accent': accent } as React.CSSProperties}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none"
                style={{ boxShadow: `inset 0 0 0 1px var(--badge-accent), 0 0 16px -2px var(--badge-accent)` }}
              ></div>

              {badge.icon && (
                <span
                  className="material-symbols-outlined text-lg flex-shrink-0 relative z-10"
                  style={{ color: accent }}
                >
                  {badge.icon}
                </span>
              )}

              <div className="flex flex-col gap-1 min-w-0 relative z-10">
                <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-[var(--terminal-text-dim)] truncate">
                  {badge.name}
                </span>
                <Image
                  src={badge.imageUrl}
                  alt={badge.name}
                  width={140}
                  height={20}
                  className="w-[120px] sm:w-[140px] block"
                  style={{ height: 'auto', ...badge.imageStyle }}
                  unoptimized
                />
              </div>

              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse relative z-10"
                style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }}
                title="Live"
                aria-hidden="true"
              ></span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
