import { siteConfig } from '@/config';
import { generateSocialImage } from '@/lib/og-image';

export const alt = `${siteConfig.fullName} | ${siteConfig.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return generateSocialImage();
}
