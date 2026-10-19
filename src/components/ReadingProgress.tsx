'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/track';

/** Thin bar at the top of the screen that fills as the `[data-reading-target]` element is read. */
export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 print:hidden">
      <div ref={barRef} className="h-full origin-left bg-primary" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}
