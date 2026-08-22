export interface CoverLetterStyle {
  id: string;
  name: string;
  description: string;
  domain: string;
  icon: string;
  salutation?: string;
  opening: string;
  body: string[];
  closing: string;
  colorScheme?: {
    primary: string;
    secondary?: string;
  };
}

export interface CoverLetterConfig {
  email?: string;
  styles: CoverLetterStyle[];
}

export const coverLetterConfig: CoverLetterConfig = {
  email: 'your.email@example.com',
  styles: [
    {
      id: 'example',
      name: 'Example',
      description: 'Example',
      domain: 'Example',
      icon: 'settings',
      opening: 'Example opening paragraph introducing yourself and the role you are targeting.',
      body: [
        'Example paragraph describing relevant experience and strengths for this style.',
        'Example paragraph describing what draws you to this kind of role.',
      ],
      closing: 'Thank you for considering my application. I would welcome the opportunity to discuss how my background could contribute to your team.',
      colorScheme: {
        primary: '#1919e6',
      },
    },
  ],
};

export const getCoverLetterStyleById = (id: string): CoverLetterStyle | undefined =>
  coverLetterConfig.styles.find(style => style.id === id);
