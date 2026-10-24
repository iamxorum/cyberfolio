import { prefersReducedMotion } from '@/lib/motion';
import { THEME_COOKIE, writePreference } from '@/lib/preferences';

export function isLightTheme(): boolean {
  return document.documentElement.classList.contains('light');
}

function applyTheme(light: boolean) {
  document.documentElement.classList.toggle('light', light);
  document.documentElement.classList.toggle('dark', !light);
  writePreference(THEME_COOKIE, light ? 'light' : 'dark');
}

/**
 * Applies and persists the theme (the layout reads the same cookie to render the page already themed).
 *
 * Every element has its own colour transition, and nested text (code blocks, spans) re-starts that
 * transition each time its parent's inherited colour changes, so parts of the page finish late. Instead,
 * transitions are switched off for the swap and the whole page crossfades once via the View Transitions API.
 */
export function setLightTheme(light: boolean) {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  const finish = () => requestAnimationFrame(() => root.classList.remove('theme-switching'));

  const reduceMotion = prefersReducedMotion();
  if (reduceMotion || typeof document.startViewTransition !== 'function') {
    applyTheme(light);
    finish();
    return;
  }
  document.startViewTransition(() => applyTheme(light)).finished.finally(finish);
}
