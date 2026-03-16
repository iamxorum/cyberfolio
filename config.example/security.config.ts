export interface SecurityConfig {
    turnstile: {
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