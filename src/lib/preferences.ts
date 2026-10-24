export const THEME_COOKIE = 'iamxorum_theme';
export const ACCENT_COOKIE = 'iamxorum_accent';

const ONE_YEAR_S = 365 * 24 * 60 * 60;

/**
 * Saves a display preference as a cookie so the server can render the page already themed.
 * It is readable by scripts on purpose (the toggles write it) and holds nothing but the choice.
 * `null` clears it.
 */
export function writePreference(name: string, value: string | null) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  const age = value === null ? 0 : ONE_YEAR_S;
  document.cookie = `${name}=${value ?? ''}; Path=/; Max-Age=${age}; SameSite=Lax${secure}`;
}
