import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.username,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#141022',
    theme_color: '#141022',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
