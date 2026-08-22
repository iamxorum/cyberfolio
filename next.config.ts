import type { NextConfig } from "next";
import { siteConfig } from "./src/config";

const { security } = siteConfig;

const isDev = process.env.NODE_ENV === 'development';

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' ${security.scripts.join(' ')};
  style-src 'self' 'unsafe-inline' ${security.styles.join(' ')};
  img-src 'self' blob: data: ${security.images.join(' ')};
  font-src 'self' ${security.fonts.join(' ')};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-src 'self' ${security.frames.join(' ')};
  connect-src 'self' ws: wss: iamxorum.ro *.iamxorum.ro ${security.connects.join(' ')};
  worker-src 'self' blob:;
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
  poweredByHeader: false,

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
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
        ],
      },
      // Everything in these paths is committed config content, immutable at a given URL —
      // unlike public/data/banned_ips.json, which is live threat data and deliberately not cached here.
      {
        source: '/assets/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/og-fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  images: {
    remotePatterns: dynamicRemotePatterns,
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;