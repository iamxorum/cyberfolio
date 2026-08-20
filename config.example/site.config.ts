export interface SiteConfig {

  domain: string;
  username: string;
  fullName: string;
  title: string;
  description: string;
  favicon: string;


  birthDate: {
    day: number;
    month: number;
    year: number;
  };
  location: string;
  role: string;
  status: string;
  profileImage: string;


  social: {
    professional?: SocialLink[];
    gaming?: SocialLink[];
    other?: SocialLink[];
  };

  systemVersion: string;

  security: {
    scripts: string[];
    styles: string[];
    images: string[];
    fonts: string[];
    frames: string[];
    connects: string[];
  };

}

export interface SocialLink {
  name: string;
  url: string;
  icon?: string;
  showInFooter?: boolean;
}

export const siteConfig: SiteConfig = {
  domain: 'example.com',
  username: 'username',
  fullName: 'Your Full Name',
  title: 'This is Your Portfolio',
  description: 'Welcome to my portfolio',

  birthDate: {
    day: 1,
    month: 1,
    year: 2000,
  },
  location: 'Your Location',
  role: 'Your Role',
  status: 'Available for opportunities',
  profileImage: '/assets/profile.jpg',

  social: {
    professional: [
      {
        name: 'GitHub',
        url: 'https://github.com/yourusername',
        icon: 'code',
        showInFooter: true,
      },
      {
        name: 'LinkedIn',
        url: 'https://www.linkedin.com/in/yourprofile',
        icon: 'work',
        showInFooter: true,
      },
    ],
    gaming: [
      {
        name: 'Steam',
        url: 'https://steamcommunity.com/id/yoursteamid',
        icon: 'sports_esports',
        showInFooter: false,
      },
    ],
    other: [
    ],
  },

  systemVersion: 'v1.4.8',

  favicon: 'path/to/favicon.ico',

  security: {
    scripts: [
      'https://challenges.cloudflare.com',
    ],
    styles: [
      'https://fonts.googleapis.com',
    ],
    images: [
      'https://flagcdn.com',
      'https://unpkg.com',
      'https://grainy-gradients.vercel.app',
      'https://*.googleusercontent.com',
      'http://*.googleusercontent.com',
    ],
    fonts: [
      'https://fonts.gstatic.com',
    ],
    frames: [
      'https://challenges.cloudflare.com',
      'https://www.youtube.com',
      'https://youtube.com',
    ],
    connects: [
      'https://challenges.cloudflare.com',
      'https://www.youtube.com',
      'https://youtube.com',
    ]
  }
};
