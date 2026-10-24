'use client';

import { useState } from 'react';
import { contentConfig } from '@/config';
import Reveal from '@/components/Reveal';
import { usePrefersReducedMotion } from '@/lib/motion';

export default function BuildNote() {
  const [expanded, setExpanded] = useState(false);
  const reduced = usePrefersReducedMotion();
  const { about } = contentConfig;
  // Optional key: a config written before it existed has no `buildNote`, and the page just skips the note.
  const lines = 'buildNote' in about && Array.isArray(about.buildNote) ? (about.buildNote as string[]) : [];
  if (lines.length === 0) return null;

  return (
    <Reveal draw className="rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] font-mono">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        aria-expanded={expanded}
        aria-controls="build-notes"
        className="flex w-full items-center justify-between gap-3 px-4 sm:px-5 py-3 text-left text-[10px] sm:text-xs tracking-widest text-[var(--terminal-text-dim)] hover:text-primary transition-colors"
      >
        HOW_THIS_WAS_BUILT
        <span
          aria-hidden="true"
          className="material-symbols-outlined text-base"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: reduced ? 'none' : 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)' }}
        >
          expand_more
        </span>
      </button>
      <div
        id="build-notes"
        className="grid"
        style={{
          gridTemplateRows: expanded ? '1fr' : '0fr',
          opacity: expanded ? 1 : 0,
          transition: reduced ? 'none' : 'grid-template-rows 280ms cubic-bezier(0.23, 1, 0.32, 1), opacity 200ms ease-out',
        }}
      >
        <div className="overflow-hidden" inert={!expanded}>
          <div className="flex flex-col gap-2 px-4 sm:px-5 pb-4 text-xs sm:text-sm leading-relaxed text-[var(--terminal-text-light)]">
            {lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
