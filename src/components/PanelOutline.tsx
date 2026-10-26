'use client';

import { useEffect, useRef, useState } from 'react';
import type { PostHeading } from '@/lib/blog';
import { readingLine } from '@/lib/reading-line';
import { sectionTime } from '@/lib/section-time';
import { HIDDEN, REVEAL, SHOWN } from '@/lib/reveal';

// A section is current once its heading passes the reading line (see readingLine): roughly where the eye is
// while reading. Before the first heading nothing is current.
const PANEL_END_SLACK_PX = 4;
// The back-to-top button shows once the panel is scrolled this far.
const BACK_TO_TOP_AFTER_PX = 240;

/**
 * "On this page" rail for a post opened in the ultrawide side panel: the same outline the full post
 * page keeps in its right margin. The panel (not the window) scrolls there, so it follows the panel.
 */
export default function PanelOutline({ headings, minutes, onJump, onTop }: { headings: PostHeading[]; minutes: number; onJump: (id: string) => void; onTop: () => void }) {
  const rootRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);
  // The last number stays in the label while it fades out, so it never blanks mid-animation.
  const [minutesLeft, setMinutesLeft] = useState(minutes);
  const [showLeft, setShowLeft] = useState(false);

  useEffect(() => {
    const scroller = rootRef.current?.closest<HTMLElement>('.uw-detail');
    if (!scroller) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const panelTop = scroller.getBoundingClientRect().top;
      const max = scroller.scrollHeight - scroller.clientHeight;
      const progress = max > 0 ? Math.min(1, scroller.scrollTop / max) : 0;
      const line = scroller.clientHeight * readingLine(progress);
      let current: string | null = null;
      for (const { id } of headings) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - panelTop <= line) current = id;
        else break;
      }
      // The last sections can't always reach the line before the panel ends, so at the end the final one is current.
      if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - PANEL_END_SLACK_PX) current = headings.at(-1)?.id ?? current;
      setActiveId(current);
      setShowTop(scroller.scrollTop > BACK_TO_TOP_AFTER_PX);
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      const left = Math.ceil(minutes * (1 - progress));
      const counting = max > 0 && progress > 0.02 && left > 0;
      if (counting) setMinutesLeft(left);
      setShowLeft(counting);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    scroller.addEventListener('scroll', schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      scroller.removeEventListener('scroll', schedule);
    };
  }, [headings, minutes]);

  return (
    <aside ref={rootRef} aria-label="Table of contents" className="sticky top-0 w-52 shrink-0 self-start font-mono">
      <nav data-native-scroll className="max-h-[calc(100dvh-9rem)] overflow-y-auto">
        <p className="mb-2 text-[10px] tracking-widest text-[var(--terminal-text-dim)]">ON_THIS_PAGE</p>
        <ol className="flex flex-col gap-0.5 text-xs">
          {headings.map((heading) => (
            <li key={heading.id} className="group/outline">
              <button
                type="button"
                onClick={() => onJump(heading.id)}
                aria-current={heading.id === activeId ? 'location' : undefined}
                className={`block w-full border-l-2 py-1 pr-2 text-left leading-snug transition-colors active:opacity-70 ${heading.level === 3 ? 'pl-6' : 'pl-3'} ${
                  heading.id === activeId ? 'border-primary text-primary' : 'border-[var(--terminal-border)] text-[var(--terminal-text-dim)] hover:border-[var(--terminal-text-dim)] hover:text-[var(--terminal-text)]'
                }`}
              >
                {heading.text}
                <span className="ml-2 whitespace-nowrap text-[10px] opacity-0 transition-opacity duration-150 group-hover/outline:opacity-60 group-focus-within/outline:opacity-60">{sectionTime(heading.words)}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <div className="mt-3 h-px bg-[var(--terminal-border)]" aria-hidden="true">
        <div ref={barRef} className="h-full origin-left bg-primary" style={{ transform: 'scaleX(0)' }} />
      </div>
      <p aria-hidden="true" className={`mt-2 text-xs tabular-nums text-[var(--terminal-text-dim)] ${REVEAL} ${showLeft ? SHOWN : HIDDEN}`}>
        {minutesLeft} min left
      </p>
      <button
        type="button"
        onClick={onTop}
        tabIndex={showTop ? 0 : -1}
        aria-hidden={!showTop}
        className={`mt-2 inline-flex items-center gap-1.5 text-xs text-[var(--terminal-text-dim)] ${REVEAL} hover:text-primary active:scale-95 ${showTop ? SHOWN : HIDDEN}`}
      >
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" /></svg>
        BACK_TO_TOP
      </button>
    </aside>
  );
}
