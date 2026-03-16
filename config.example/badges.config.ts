export interface BadgeConfig {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  statusText: string;
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
  //   statusText: '[ STATUS: VERIFIED ]',
  //   containerClasses: 'bg-gradient-to-br from-[#058403] to-[#111] shadow-lg',
  //   imageStyle: {
  //     background: '#35c246 linear-gradient(rgba(255,255,255,0), rgba(255,255,255,.3) 50%, rgba(0,0,0,.2) 51%, rgba(0,0,0,0))',
  //   }
  // }
];
