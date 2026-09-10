export interface BadgeConfig {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  /** Material Symbols icon name shown next to the badge label. */
  icon?: string;
  /** Accent hex (no '#') this badge's identity is built around — drives the card's hover glow. */
  accent?: string;
  containerClasses?: string;
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
  //   containerClasses: 'bg-gradient-to-br from-[#058403] to-[#111] shadow-lg',
  //   imageStyle: {
  //     background: '#35c246 linear-gradient(rgba(255,255,255,0), rgba(255,255,255,.3) 50%, rgba(0,0,0,.2) 51%, rgba(0,0,0,0))',
  //   }
  // }
];
