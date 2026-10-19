'use client';

import { useEffect, useRef } from 'react';

/** Thin bar at the top of the screen that fills as the `[data-reading-target]` element is read. */
export default function ReadingProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.querySelector('[data-reading-target]');
    const bar = barRef.current;
    if (!target || !bar) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = target.getBoundingClientRect();
      // Full once the end of the article reaches the bottom of the screen.
      const readable = Math.max(1, height - window.innerHeight);
      bar.style.transform = `scaleX(${Math.min(1, Math.max(0, -top / readable))})`;
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
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 print:hidden">
      <div ref={barRef} className="h-full origin-left bg-primary" style={{ transform: 'scaleX(0)' }} />
    </div>
  );
}
