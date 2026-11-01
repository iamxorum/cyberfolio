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
      siteConfig.appIcons?.pwa192 && { src: siteConfig.appIcons.pwa192, sizes: '192x192', type: 'image/png' },
      siteConfig.appIcons?.pwa512 && { src: siteConfig.appIcons.pwa512, sizes: '512x512', type: 'image/png' },
    ].filter((icon): icon is { src: string; sizes: string; type: string } => Boolean(icon)),
  };
}
