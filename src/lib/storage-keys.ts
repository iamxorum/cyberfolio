/** Prefix of every cookie and localStorage key this site writes. Changing it resets each visitor's theme, intro and access once. */
const PREFIX = 'cyberfolio';

export const THEME_COOKIE = `${PREFIX}_theme`;
export const ACCENT_COOKIE = `${PREFIX}_accent`;
export const ACCESS_COOKIE_NAME = `${PREFIX}_access`;
export const INITIALIZED_KEY = `${PREFIX}_initialized`;
export const USER_ID_KEY = `${PREFIX}_user_id`;
