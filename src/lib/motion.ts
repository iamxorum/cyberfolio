export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Per-item delay step for staggered list/grid entrances (cards, timeline rows). */
export const STAGGER_STEP_MS = 110;

/** Per-item delay step for dense, frequently-refreshing lists (skill rows, log tickers). */
export const STAGGER_STEP_DENSE_MS = 60;
