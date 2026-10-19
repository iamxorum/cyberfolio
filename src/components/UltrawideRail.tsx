'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { ULTRAWIDE_QUERY } from '@/hooks/useUltrawide';

// Whether `el` (or an ancestor below `root`) can still scroll vertically in the wheel's direction.
function canScrollInside(el: HTMLElement | null, root: HTMLElement, deltaY: number) {
  for (let node = el; node && node !== root; node = node.parentElement) {
    if (node.scrollHeight <= node.clientHeight) continue;
    const overflowY = getComputedStyle(node).overflowY;
    if (overflowY !== 'auto' && overflowY !== 'scroll') continue;
    const atTop = node.scrollTop <= 0;
    const atBottom = node.scrollTop + node.clientHeight >= node.scrollHeight - 1;
    if ((deltaY < 0 && !atTop) || (deltaY > 0 && !atBottom)) return true;
  }
  return false;
}

// Calls `onChange` whenever the rail or any of its panels changes size, or a panel is added or
// removed (a detail pane opening, content loading), since each shifts the scroll width.
// Returns the teardown that releases both observers.
function watchRailSize(rail: HTMLElement, onChange: () => void): () => void {
  const resizeObserver = new ResizeObserver(onChange);
  const observeAll = () => {
    resizeObserver.disconnect();
    resizeObserver.observe(rail);
    Array.from(rail.children).forEach((child) => resizeObserver.observe(child));
  };
  const mutationObserver = new MutationObserver(observeAll);
  observeAll();
  mutationObserver.observe(rail, { childList: true });
  return () => {
    resizeObserver.disconnect();
    mutationObserver.disconnect();
  };
}

// On ultrawide screens the page flows sideways: the wheel (and arrow keys) scroll the rail
// horizontally with a little inertia. Everywhere else this renders as a plain <main>.
export default function UltrawideRail({ children, className = '' }: { children: ReactNode; className?: string }) {
  const railRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const mq = window.matchMedia(ULTRAWIDE_QUERY);
    const smooth = !prefersReducedMotion();

    let target = rail.scrollLeft;
    let frame = 0;

    const maxScroll = () => rail.scrollWidth - rail.clientWidth;
    // The bar is only shown while there is something to scroll sideways.
    const syncBar = () => {
      const max = maxScroll();
      const bar = barRef.current;
      if (!bar) return;
      bar.style.setProperty('--rail-progress', String(max > 0 ? rail.scrollLeft / max : 0));
      bar.dataset.idle = String(max <= 1);
    };
    const step = () => {
      const diff = target - rail.scrollLeft;
      if (Math.abs(diff) < 0.5) {
        rail.scrollLeft = target;
        frame = 0;
        return;
      }
      rail.scrollLeft += diff * 0.14;
      frame = requestAnimationFrame(step);
    };
    const scrollTo = (x: number) => {
      target = Math.max(0, Math.min(maxScroll(), x));
      if (!smooth) rail.scrollLeft = target;
      else if (!frame) frame = requestAnimationFrame(step);
    };

    const onWheel = (e: WheelEvent) => {
      if (!mq.matches || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      // Elements that use the wheel themselves (the globe zooms with it) keep it.
      if ((e.target as HTMLElement).closest('[data-wheel-capture]')) return;
      if (canScrollInside(e.target as HTMLElement, rail, e.deltaY)) return;
      e.preventDefault();
      if (!frame) target = rail.scrollLeft;
      scrollTo(target + e.deltaY);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (!mq.matches || e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return;
      const page = rail.clientWidth * 0.8;
      const keys: Record<string, number> = { ArrowRight: 200, ArrowLeft: -200, PageDown: page, PageUp: -page };
      if (e.key === 'Home') scrollTo(0);
      else if (e.key === 'End') scrollTo(maxScroll());
      else if (e.key in keys) scrollTo((frame ? target : rail.scrollLeft) + keys[e.key]);
      else return;
      e.preventDefault();
    };

    rail.addEventListener('wheel', onWheel, { passive: false });
    rail.addEventListener('scroll', syncBar, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', syncBar);
    syncBar();

    const stopWatching = watchRailSize(rail, syncBar);

    return () => {
      stopWatching();
      cancelAnimationFrame(frame);
      rail.removeEventListener('wheel', onWheel);
      rail.removeEventListener('scroll', syncBar);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', syncBar);
    };
  }, []);

  return (
    <>
      {/* data-lenis-prevent keeps Lenis from hijacking wheel events over the rail. */}
      <main ref={railRef} id="main-content" tabIndex={-1} data-lenis-prevent className={`uw-rail ${className}`.trim()}>
        {children}
      </main>
      <div ref={barRef} className="uw-progress" data-idle="true" aria-hidden="true">
        <div className="uw-progress-fill" />
        <span className="uw-progress-hint font-mono">SCROLL →</span>
      </div>
    </>
  );
}
