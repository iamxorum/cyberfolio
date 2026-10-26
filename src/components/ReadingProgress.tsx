'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useReadingStats } from '@/hooks/useReadingStats';
import { prefersReducedMotion } from '@/lib/motion';
import { HIDDEN, REVEAL, SHOWN } from '@/lib/reveal';
import { track } from '@/lib/track';

/**
 * Thin bar at the top of the screen that fills as the `[data-reading-target]` element is read, plus a
 * small corner widget with the time left and a back-to-top button. Where the post has a side outline
 * (`hasSidebar`, wide screens) those two live there instead, so the corner widget steps aside.
 */
export default function ReadingProgress({ minutes, hasSidebar }: { minutes: number; hasSidebar: boolean }) {
  const barRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { minutesLeft, showLeft, showTop } = useReadingStats(minutes);

  useEffect(() => {
    const target = document.querySelector('[data-reading-target]');
    const bar = barRef.current;
    if (!target || !bar) return;

    let frame = 0;
    let reported = false;
    const update = () => {
      frame = 0;
      const { top, height } = target.getBoundingClientRect();
      // Full once the end of the article reaches the bottom of the screen.
      const readable = Math.max(1, height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -top / readable));
      bar.style.transform = `scaleX(${progress})`;
      // Reaching the end of a long-enough post counts as a read; short posts that fit the screen don't.
      if (!reported && progress >= 0.9 && height > window.innerHeight) {
        reported = true;
        track('blog_read', { post: pathname });
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [pathname]);

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 print:hidden">
        <div ref={barRef} className="h-full origin-left bg-primary" style={{ transform: 'scaleX(0)' }} />
      </div>
      <div className={`pointer-events-none fixed bottom-4 right-4 z-40 flex items-center gap-2 font-mono text-xs print:hidden ${hasSidebar ? 'xl:hidden' : ''}`}>
        <span aria-hidden="true" className={`rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] px-2.5 py-1.5 tabular-nums text-[var(--terminal-text-dim)] ${REVEAL} ${showLeft ? SHOWN : HIDDEN}`}>
          {minutesLeft} min left
        </span>
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
          aria-label="Back to top"
          tabIndex={showTop ? 0 : -1}
          aria-hidden={!showTop}
          className={`grid size-9 place-items-center rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] text-[var(--terminal-text-dim)] ${REVEAL} hover:border-primary hover:text-primary active:scale-90 ${showTop ? SHOWN : HIDDEN}`}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" /></svg>
        </button>
      </div>
    </>
  );
}
