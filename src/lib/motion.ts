import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(onChange: () => void) {
  const mql = window.matchMedia(REDUCED_MOTION_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** Render-safe variant: the server snapshot is `false`, so hydration matches, then it syncs. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Per-item delay step for staggered list/grid entrances (cards, timeline rows). */
export const STAGGER_STEP_MS = 110;

/** Per-item delay step for dense, frequently-refreshing lists (skill rows, log tickers). */
export const STAGGER_STEP_DENSE_MS = 60;
