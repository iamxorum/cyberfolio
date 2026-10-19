/** Cloudflare Turnstile widget. The matching secret key is TURNSTILE_SECRET_KEY in `.env`. */
export interface SecurityConfig {
    turnstile: {
        /** Public site key from the Cloudflare dashboard. */
        siteKey: string;
        theme: 'light' | 'dark' | 'auto';
    };
}

export const securityConfig: SecurityConfig = {
    turnstile: {
        siteKey: 'SITE_KEY',
        theme: 'dark' as const,
    },
};