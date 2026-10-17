export function isLightTheme(): boolean {
  return document.documentElement.classList.contains('light');
}

function applyTheme(light: boolean) {
  document.documentElement.classList.toggle('light', light);
  document.documentElement.classList.toggle('dark', !light);
  try {
    localStorage.setItem('theme', light ? 'light' : 'dark');
  } catch {
    // Storage can be blocked; the theme still applies for this visit.
  }
}

/**
 * Applies and persists the theme (the layout's pre-hydration script reads the same key).
 *
 * Every element has its own colour transition, and nested text (code blocks, spans) re-starts that
 * transition each time its parent's inherited colour changes, so parts of the page finish late. Instead,
 * transitions are switched off for the swap and the whole page crossfades once via the View Transitions API.
 */
export function setLightTheme(light: boolean) {
  const root = document.documentElement;
  root.classList.add('theme-switching');
  const finish = () => requestAnimationFrame(() => root.classList.remove('theme-switching'));

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof document.startViewTransition !== 'function') {
    applyTheme(light);
    finish();
    return;
  }
  document.startViewTransition(() => applyTheme(light)).finished.finally(finish);
}
