export interface BadgeConfig {
  id: string;
  name: string;
  url: string;
  /** Remote badge image. Omit it and set `pill` for a static, self-rendered badge (no network request). */
  imageUrl?: string;
  /** Static two-part badge, e.g. { label: 'Turfwar', value: 'Season 1 Winner' }. */
  pill?: { label: string; value: string };
  /** Material Symbols icon name shown next to the badge label. */
  icon?: string;
  /** Accent hex (no '#') this badge's identity is built around — drives the card's hover glow. */
  accent?: string;
  /** Image width / height (e.g. 4 for a 400x100 SVG). Reserves the slot so the card doesn't jump when the image loads. */
  aspect?: number;
  imageStyle?: React.CSSProperties;
}

export const badges: BadgeConfig[] = [
  // Example badge config
  // {
  //   id: 'example',
  //   name: 'Example Contributor Badge',
  //   url: 'https://example.com/user/123',
  //   imageUrl: 'https://example.com/contributor/123.svg',
  //   icon: 'verified_user',
  //   accent: '35C246',
  //   aspect: 4,
  //   imageStyle: {
  //     background: '#35c246 linear-gradient(rgba(255,255,255,0), rgba(255,255,255,.3) 50%, rgba(0,0,0,.2) 51%, rgba(0,0,0,0))',
  //   }
  // }
];
