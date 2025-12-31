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
  
  systemVersion: 'v1.2.0',
  
  favicon: 'path/to/favicon.ico',
};
