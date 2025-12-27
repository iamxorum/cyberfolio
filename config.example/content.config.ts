import { SiteConfig } from './site.config';

export interface ContentConfig {
  
  home: {
    hero: {
      title: string;
      subtitle: string;
      ctaPrimary: {
        text: string;
        link: string;
      };
      ctaSecondary: {
        text: string;
        link?: string;
      };
    };
    stats: {
      uptime: {
        label: string;
        icon: string;
      };
      sessionId: {
        label: string;
        icon: string;
      };
      viewport: {
        label: string;
        icon: string;
      };
      responseTime: {
        label: string;
        icon: string;
      };
    };
  };
  
  
  about: {
    bio: {
      title: string;
      paragraphs: string[];
    };
  };
  
  
  projects: {
    title: string;
    subtitle: string;
    terminalHint: string;
  };
}

export const contentConfig: ContentConfig = {
  home: {
    hero: {
      title: '> H3LL0_W0R7D',
      subtitle: 'initialized. \n Loaded assets. \n Prepared log file. \n Terminal ready.',
      ctaPrimary: {
        text: '> EXECUTE_BIO',
        link: '/about',
      },
      ctaSecondary: {
        text: '> ACCESS_PROJECTS',
        link: '/projects',
      },
    },
    stats: {
      uptime: {
        label: 'UPTIME',
        icon: 'timer',
      },
      sessionId: {
        label: 'SESSION_ID',
        icon: 'fingerprint',
      },
      viewport: {
        label: 'VIEWPORT',
        icon: 'desktop_windows',
      },
      responseTime: {
        label: 'RESPONSE_TIME',
        icon: 'speed',
      },
    },
  },
  about: {
    bio: {
      title: 'root@username:~$ cat /var/log/user_bio.txt',
      paragraphs: [
        'Your bio paragraph here. Describe yourself, your passion, and what you do.',
        'Add more paragraphs as needed to tell your story.',
      ],
    },
  },
  projects: {
    title: '>> SYSTEM_READY',
    subtitle: 'Listing all executable project files in local directory...',
    terminalHint: 'Type "help" to see available commands. Use ↑↓ for history, Tab for autocomplete.',
  },
};
