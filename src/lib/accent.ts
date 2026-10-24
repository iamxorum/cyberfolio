// Accent presets: set as data-accent on <html>, colours in colors.css. The layout script restores the saved one before first paint.
export const ACCENTS = ['default', 'cyan', 'teal', 'green', 'blue', 'violet', 'magenta', 'red', 'orange', 'mono'] as const;

/** `matrix` is the Konami preset and is not in the picker. */
export type Accent = (typeof ACCENTS)[number] | 'matrix';

/** Dot colour per preset in the picker. */
export const ACCENT_DOT: Record<Accent, string> = {
  default: '#b0a61a',
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
    // storage can be blocked
  }
}
