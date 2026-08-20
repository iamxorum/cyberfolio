import type { NextConfig } from "next";
import { siteConfig } from "./src/config";

const { security } = siteConfig;

const isDev = process.env.NODE_ENV === 'development';

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' ${security.scripts.join(' ')};
  style-src 'self' 'unsafe-inline' ${security.styles.join(' ')};
  img-src 'self' blob: data: ${security.images.join(' ')};
  font-src 'self' ${security.fonts.join(' ')};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-src 'self' https://open.spotify.com https://www.youtube.com https://w.soundcloud.com ${security.frames.join(' ')};
  connect-src 'self' ws: wss: iamxorum.ro *.iamxorum.ro ${security.connects.join(' ')};
  worker-src 'self' blob:;
  child-src 'self' https://challenges.cloudflare.com;
  ${isDev ? '' : 'upgrade-insecure-requests;'}
`.replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim();

const dynamicRemotePatterns = security.images.map((domain) => {
  const isHttp = domain.startsWith('http://');
  const cleanHostname = domain.replace(/^https?:\/\//, '');

  return {
    protocol: (isHttp ? 'http' : 'https') as 'http' | 'https',
    hostname: cleanHostname,
  };
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.8.0.108'],
  output: 'standalone',

  experimental: {
    viewTransition: true,
  },

  async headers() {
    if (isDev) return [];
    
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Content-Security-Policy', value: cspHeader },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  images: {
    remotePatterns: dynamicRemotePatterns,
  },
};

export default nextConfig;