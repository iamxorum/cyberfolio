export const isDevelopment = process.env.NODE_ENV === 'development';

/** Hosts the dev server is reached on besides localhost (e.g. a phone or ultrawide on the LAN/VPN). */
export const DEV_LAN_HOSTS = ['10.8.0.121'];

/** Origins the API routes accept in development only; empty in production. */
export const devOrigins: string[] = isDevelopment
  ? ['localhost', ...DEV_LAN_HOSTS].flatMap((host) => [3000, 3001].map((port) => `http://${host}:${port}`))
  : [];
