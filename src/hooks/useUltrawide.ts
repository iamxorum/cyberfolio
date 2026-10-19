import { useSyncExternalStore } from 'react';

// Keep in sync with the `.uw-*` media query in globals.css.
export const ULTRAWIDE_QUERY = 'screen and (min-aspect-ratio: 21/10) and (min-width: 1900px)';

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(ULTRAWIDE_QUERY);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
}

/** True on ultrawide screens. The server snapshot is `false`, so hydration matches, then it syncs. */
export function useUltrawide(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(ULTRAWIDE_QUERY).matches, () => false);
}
