export interface SocialLink {
  name: string;
  url: string;
  /** Material Symbols icon name. */
  icon?: string;
  /** Also listed in the footer. */
  showInFooter?: boolean;
}

/** Contact email and phone are not here: they live in CONTACT_EMAIL / CONTACT_PHONE in `.env`. */
export interface SiteConfig {
  /** Main domain, no protocol. Used for canonical URLs, the sitemap and origin checks. */
  domain: string;
  /** Other domains that redirect to the main one. Turnstile tokens issued on them are accepted too. */
  alternateDomains?: string[];
  /** Handle shown in the header and the terminal prompt. */
  username: string;
  fullName: string;
  /** Site name: the home page title, social cards and the web app manifest. */
  title: string;
  /** Default meta description. */
  description: string;
  favicon?: string;
  /** Shown as a live age on /about. `month` is 1-12. */
  birthDate: {
    day: number;
    month: number;
    year: number;
  };
  location: string;
  role: string;
  /** Availability line in the hero and on the profile card. */
  status: string;
  profileImage: string;
  social: {
    professional?: SocialLink[];
    gaming?: SocialLink[];
    other?: SocialLink[];
  };
  /** Version label in the footer. */
  systemVersion: string;
  /** Hosts allowed by the Content-Security-Policy and next/image. Add a host here when you embed something new. */
  security: {
    scripts: string[];
    styles: string[];
    images: string[];
    fonts: string[];
    frames: string[];
    connects: string[];
  };
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

  systemVersion: 'v1.6.8',

  favicon: 'path/to/favicon.ico',

  security: {
    scripts: [
      'https://challenges.cloudflare.com',
    ],
    styles: [
    ],
    images: [
      'https://flagcdn.com',
      'https://unpkg.com',
      'https://grainy-gradients.vercel.app',
      'https://*.googleusercontent.com',
      'http://*.googleusercontent.com',
      'https://*.steamstatic.com',
      'https://i.scdn.co',
    ],
    fonts: [
    ],
    frames: [
      'https://challenges.cloudflare.com',
      'https://www.youtube.com',
      'https://youtube.com',
      'https://open.spotify.com',
      'https://w.soundcloud.com',
    ],
    connects: [
      'https://challenges.cloudflare.com',
      'https://www.youtube.com',
      'https://youtube.com',
      'https://open.spotify.com',
      'https://api-widget.soundcloud.com',
    ]
  }
};
