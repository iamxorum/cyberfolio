'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PostHeading } from '@/lib/blog';
import { useReadingStats } from '@/hooks/useReadingStats';
import { prefersReducedMotion } from '@/lib/motion';
import { readingLine } from '@/lib/reading-line';
import { sectionTime } from '@/lib/section-time';
import { HIDDEN, REVEAL, SHOWN } from '@/lib/reveal';
import { eventProps } from '@/lib/track';

export const MIN_HEADINGS = 3;
// A section becomes current when its heading passes the reading line (see readingLine): roughly where the
// eye is while reading, so the highlight follows what is being read rather than what has just scrolled into
// view. Before the first heading nothing is current.
const PAGE_END_SLACK_PX = 4;

function useActiveHeading(ids: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const article = document.querySelector('[data-reading-target]');
    let frame = 0;
    const update = () => {
      frame = 0;
      // The current section is the last heading that has passed the reading line.
      const { top, height } = article?.getBoundingClientRect() ?? { top: 0, height: 0 };
      const progress = Math.min(1, Math.max(0, -top / Math.max(1, height - window.innerHeight)));
      const line = window.innerHeight * readingLine(progress);
      let current: string | null = null;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      // The last sections can't always reach the line before the page ends, so at the end the final one is current.
      const atPageEnd = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - PAGE_END_SLACK_PX;
      if (atPageEnd) current = elements[elements.length - 1].id;
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids]);

  return activeId;
}

function OutlineLinks({ headings, activeId, showTime = false }: { headings: PostHeading[]; activeId: string | null; showTime?: boolean }) {
  return (
    <ol className="flex flex-col gap-0.5 font-mono text-xs">
      {headings.map((heading) => {
        const isActive = heading.id === activeId;
        return (
          <li key={heading.id} className="group/outline">
            <a
              href={`#${heading.id}`}
              {...eventProps('toc_click', { heading: heading.id })}
              aria-current={isActive ? 'location' : undefined}
              className={`block border-l-2 py-1 pr-2 leading-snug transition-colors ${heading.level === 3 ? 'pl-6' : 'pl-3'} ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-[var(--terminal-border)] text-[var(--terminal-text-dim)] hover:text-[var(--terminal-text)] hover:border-[var(--terminal-text-dim)]'
              }`}
            >
              {heading.text}
              {showTime && <span className="ml-2 whitespace-nowrap text-[10px] opacity-0 transition-opacity duration-150 group-hover/outline:opacity-60 group-focus-within/outline:opacity-60">{sectionTime(heading.words)}</span>}
            </a>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * "On this page" outline for long posts. `sidebar` is a sticky rail in the right margin on wide screens
 * with the current section highlighted; `inline` is a collapsible list above the post for narrower ones.
 */
export default function TableOfContents({ headings, variant, minutes = 0 }: { headings: PostHeading[]; variant: 'sidebar' | 'inline'; minutes?: number }) {
  const ids = useMemo(() => (variant === 'sidebar' ? headings.map((h) => h.id) : []), [headings, variant]);
  const activeId = useActiveHeading(ids);
  const barRef = useRef<HTMLDivElement>(null);
  const { minutesLeft, showLeft, showTop } = useReadingStats(minutes, barRef);

  if (headings.length < MIN_HEADINGS) return null;

  if (variant === 'inline') {
    return (
      <details className="xl:hidden print:hidden rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface)] px-4 py-3 group">
        <summary className="cursor-pointer select-none font-mono text-xs tracking-widest text-[var(--terminal-text-dim)] hover:text-primary list-none flex items-center justify-between">
          ON_THIS_PAGE
          <span className="material-symbols-outlined text-base transition-transform group-open:rotate-180" aria-hidden="true">expand_more</span>
        </summary>
        <nav aria-label="Table of contents" className="mt-3">
          <OutlineLinks headings={headings} activeId={null} />
        </nav>
      </details>
    );
  }

  return (
    <aside className="hidden xl:block print:hidden absolute left-full top-0 h-full ml-10 w-56" aria-label="Table of contents">
      <div className="sticky top-[calc(var(--header-h,64px)+24px)]">
        <nav className="max-h-[calc(100vh-var(--header-h,64px)-8rem)] overflow-y-auto" data-lenis-prevent>
          <p className="mb-2 font-mono text-[10px] tracking-widest text-[var(--terminal-text-dim)]">ON_THIS_PAGE</p>
          <OutlineLinks headings={headings} activeId={activeId} showTime />
        </nav>
        {minutes > 0 && (
          <div className="mt-3 flex flex-col items-start gap-2 font-mono text-xs text-[var(--terminal-text-dim)]">
            <div className="h-px w-full bg-[var(--terminal-border)]" aria-hidden="true">
              <div ref={barRef} className="h-full origin-left bg-primary" style={{ transform: 'scaleX(0)' }} />
            </div>
            <p aria-hidden="true" className={`tabular-nums ${REVEAL} ${showLeft ? SHOWN : HIDDEN}`}>{minutesLeft} min left</p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
              tabIndex={showTop ? 0 : -1}
              aria-hidden={!showTop}
              className={`inline-flex items-center gap-1.5 ${REVEAL} hover:text-primary active:scale-95 ${showTop ? SHOWN : HIDDEN}`}
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" /></svg>
              BACK_TO_TOP
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
