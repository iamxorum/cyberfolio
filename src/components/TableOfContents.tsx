'use client';

import { useEffect, useMemo, useState } from 'react';
import type { PostHeading } from '@/lib/blog';
import { eventProps } from '@/lib/track';

const MIN_HEADINGS = 3;
// A section becomes current as soon as its heading rises this far above the bottom edge of the screen.
// Tracking the bottom (not the top) means the last section lights up too: its heading never has to
// scroll all the way up, which it can't when the page ends first.
const ACTIVE_FROM_BOTTOM_PX = 140;
const PAGE_END_SLACK_PX = 4;

function useActiveHeading(ids: string[]) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      // The current section is the last heading that has entered the bottom of the screen.
      const line = window.innerHeight - ACTIVE_FROM_BOTTOM_PX;
      let current = elements[0].id;
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
        else break;
      }
      // At the very end of the page, the final section is the one being read.
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

function OutlineLinks({ headings, activeId }: { headings: PostHeading[]; activeId: string | null }) {
  return (
    <ol className="flex flex-col gap-0.5 font-mono text-xs">
      {headings.map((heading) => {
        const isActive = heading.id === activeId;
        return (
          <li key={heading.id}>
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
export default function TableOfContents({ headings, variant }: { headings: PostHeading[]; variant: 'sidebar' | 'inline' }) {
  const ids = useMemo(() => (variant === 'sidebar' ? headings.map((h) => h.id) : []), [headings, variant]);
  const activeId = useActiveHeading(ids);

  if (headings.length < MIN_HEADINGS) return null;

  if (variant === 'inline') {
    return (
      <details className="xl:hidden rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface)] px-4 py-3 group">
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
    <aside className="hidden xl:block absolute left-full top-0 h-full ml-10 w-56" aria-label="Table of contents">
      <nav className="sticky top-[calc(var(--header-h,64px)+24px)] max-h-[calc(100vh-var(--header-h,64px)-48px)] overflow-y-auto" data-lenis-prevent>
        <p className="mb-2 font-mono text-[10px] tracking-widest text-[var(--terminal-text-dim)]">ON_THIS_PAGE</p>
        <OutlineLinks headings={headings} activeId={activeId} />
      </nav>
    </aside>
  );
}
