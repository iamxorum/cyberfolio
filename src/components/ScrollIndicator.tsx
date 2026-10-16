'use client';

import { useEffect, useRef } from 'react';

// Replaces the native scrollbar on desktop: a slim rail on the right edge that is empty at
// the top of the page and fills as you scroll down. Click or drag it to jump around the page.
// It writes straight to the DOM from the scroll handler, so scrolling never triggers a
// React re-render.
export default function ScrollIndicator({ variant = 'accent' }: { variant?: 'accent' | 'blue' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;

    let frame = 0;
    const update = () => {
      frame = 0;
      const max = maxScroll();
      const progress = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
      fillRef.current?.style.setProperty('transform', `scaleY(${progress})`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // Pointer position along the strip maps straight onto page position.
    const scrollToPointer = (clientY: number) => {
      const ratio = Math.min(Math.max(clientY / window.innerHeight, 0), 1);
      window.scrollTo({ top: ratio * maxScroll(), behavior: 'instant' });
    };
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      container.setPointerCapture(e.pointerId);
      container.dataset.dragging = 'true';
      scrollToPointer(e.clientY);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (container.hasPointerCapture(e.pointerId)) scrollToPointer(e.clientY);
    };
    const onPointerEnd = (e: PointerEvent) => {
      if (container.hasPointerCapture(e.pointerId)) container.releasePointerCapture(e.pointerId);
      delete container.dataset.dragging;
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', onPointerEnd);
    container.addEventListener('pointercancel', onPointerEnd);
    // Page height changes as content loads or sections expand.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', onPointerEnd);
      container.removeEventListener('pointercancel', onPointerEnd);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="scroll-indicator" data-variant={variant} aria-hidden="true">
      <div className="scroll-indicator-rail">
        <div ref={fillRef} className="scroll-indicator-fill" />
      </div>
    </div>
  );
}
