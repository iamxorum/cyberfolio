import { securityConfig } from '@/config';

// Cloudflare's official test keys (documented, not secret): the site key always
// passes visibly, paired with a secret key that always verifies successfully.
// https://developers.cloudflare.com/turnstile/troubleshooting/testing/
const DEV_TEST_SITE_KEY = '1x00000000000000000000AA';
const DEV_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA';

const isDevelopment = process.env.NODE_ENV === 'development';

export function getTurnstileSiteKey(): string {
  return isDevelopment ? DEV_TEST_SITE_KEY : securityConfig.turnstile.siteKey;
}

export function getTurnstileSecretKey(): string | undefined {
  return isDevelopment ? DEV_TEST_SECRET_KEY : process.env.TURNSTILE_SECRET_KEY;
}
