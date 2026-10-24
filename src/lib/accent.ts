// Accent colour presets, applied as `data-accent` on <html> (the swatches live in colors.css). The layout's
// pre-hydration script reads the same `accent` key, so the choice is in place before the first paint.
export const ACCENTS = ['default', 'cyan', 'teal', 'green', 'blue', 'violet', 'magenta', 'red', 'orange', 'mono'] as const;

/** `matrix` is a secret preset (Konami code): outside the cycle, so the picker moves on to `default` from it. */
export type Accent = (typeof ACCENTS)[number] | 'matrix';

/** Dark-theme primary of each preset, for the picker's dot. `default` reads the live variable instead. */
export const ACCENT_DOT: Record<Accent, string> = {
  default: 'var(--color-primary)',
  cyan: '#1fb5c9',
  teal: '#14b8a6',
  green: '#2fb344',
  blue: '#3b82f6',
  violet: '#9a7cf8',
  magenta: '#c026d3',
  red: '#ef4444',
  orange: '#e0731a',
  mono: '#d4d4d8',
  matrix: '#00ff41',
};

export function getAccent(): Accent {
  const value = document.documentElement.dataset.accent;
  return ACCENTS.includes(value as (typeof ACCENTS)[number]) || value === 'matrix' ? (value as Accent) : 'default';
}

export function setAccent(accent: Accent) {
  const root = document.documentElement;
  if (accent === 'default') delete root.dataset.accent;
  else root.dataset.accent = accent;
  try {
    if (accent === 'default') localStorage.removeItem('accent');
    else localStorage.setItem('accent', accent);
  } catch {
    // Storage can be blocked; the accent still applies for this visit.
  }
}
