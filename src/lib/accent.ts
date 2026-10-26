import { ACCENT_COOKIE, writePreference } from '@/lib/preferences';

// Accent presets: set as data-accent on <html>, colours in colors.css. The layout renders the saved one (from its cookie) into the first HTML.
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

/** Whether a stored value (cookie or otherwise) names a real preset. */
export const isAccent = (value: unknown): value is Accent =>
  ACCENTS.includes(value as (typeof ACCENTS)[number]) || value === 'matrix';

export function getAccent(): Accent {
  const value = document.documentElement.dataset.accent;
  return isAccent(value) ? value : 'default';
}

export function setAccent(accent: Accent) {
  const root = document.documentElement;
  if (accent === 'default') delete root.dataset.accent;
  else root.dataset.accent = accent;
  writePreference(ACCENT_COOKIE, accent === 'default' ? null : accent);
}

/** Accent per preset on white paper: the light-theme values from colors.css, dark enough to read in print. */
export const ACCENT_PRINT: Record<Accent, string> = {
  default: '#645407',
  cyan: '#0e6e7a',
  teal: '#0f766e',
  green: '#17692a',
  blue: '#1d4ed8',
  violet: '#5b21b6',
  magenta: '#86198f',
  red: '#991b1b',
  orange: '#8a4208',
  mono: '#27272a',
  matrix: '#0b5a1f',
};

/** The CV and cover letter take the site's current accent. Browser only: on the server it is the default. */
export function getPrintAccent(): string {
  return ACCENT_PRINT[typeof document === 'undefined' ? 'default' : getAccent()];
}

/** Mixes a #rrggbb colour with white (0 = same, 1 = white). Plain hex, which the PDF renderer needs. */
export function tint(hex: string, amount: number): string {
  const channel = (i: number) => Math.round(parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) * (1 - amount) + 255 * amount);
  return `#${[0, 1, 2].map((i) => channel(i).toString(16).padStart(2, '0')).join('')}`;
}
