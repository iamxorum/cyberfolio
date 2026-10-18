import { useSyncExternalStore, type CSSProperties } from 'react';
import { features } from '@/config';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/**
 * Render-safe variant: the server snapshot is `false`, so hydration matches, then it syncs.
 * Calm mode (features.calmMode) counts as reduced motion for everyone; it is a build-time constant,
 * so server and client always agree.
 */
export function usePrefersReducedMotion(): boolean {
  const system = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
  return features.calmMode || system;
}

export function prefersReducedMotion(): boolean {
  if (features.calmMode) return true;
  if (typeof window === 'undefined') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Per-item delay step for staggered list/grid entrances (cards, timeline rows). */
export const STAGGER_STEP_MS = 110;

/** Per-item delay step for dense, frequently-refreshing lists (skill rows, log tickers). */
export const STAGGER_STEP_DENSE_MS = 60;

/**
 * Runs `cb` once the boot screen is dismissed (`html.boot-done`), so entrances aren't spent behind it.
 * Pages that never mount a boot screen (e.g. /cv) have nothing to wait for, so those run immediately.
 */
export function whenBootDone(cb: () => void): () => void {
  const root = document.documentElement;
  if (root.classList.contains('boot-done') || !document.querySelector('.boot-screen-overlay')) {
    cb();
    return () => {};
  }
  const observer = new MutationObserver(() => {
    if (!root.classList.contains('boot-done')) return;
    observer.disconnect();
    cb();
  });
  observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

/** Fires `cb` once when `el` first scrolls into view (and the boot screen is gone). Returns a cleanup. */
export function observeOnce(el: Element, cb: () => void, rootMargin = '0px 0px -10% 0px'): () => void {
  let cancelBoot = () => {};
  if (typeof IntersectionObserver === 'undefined') {
    cancelBoot = whenBootDone(cb);
    return () => cancelBoot();
  }
  const io = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting) return;
    io.disconnect();
    cancelBoot = whenBootDone(cb);
  }, { rootMargin });
  io.observe(el);
  return () => {
    io.disconnect();
    cancelBoot();
  };
}

/** Inline style carrying the per-item delay read by `.scroll-reveal` / `.panel-draw`. */
export function revealDelay(ms: number): CSSProperties {
  return { '--reveal-delay': `${ms}ms` } as CSSProperties;
}
