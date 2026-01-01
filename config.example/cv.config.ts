export interface CVStyle {
  id: string;
  name: string;
  description: string;
  domain: string; 
  icon: string;
  summary?: string; 
  skillCategories?: string[]; 
  showProjects?: boolean; 
  colorScheme?: {
    primary: string;
    secondary?: string;
  };
}

export interface CVConfig {
  summary?: string;
  styles: CVStyle[];
  cvProfileImage?: string; 
}

export const cvConfig: CVConfig = {
  summary: 'Your default professional summary that will be used if no style-specific summary is provided. This should be a general overview of your professional background, skills, and career goals.',
  styles: [
    {
      id: 'example',
      name: 'Example',
      description: 'Example',
      domain: 'Example',
      icon: 'settings',
      summary: 'Example',
      skillCategories: ['Example'],
      colorScheme: {
        primary: '#1919e6',
      }, 
    },
  ],
};

export const getCVStyleById = (id: string): CVStyle | undefined => {
  return cvConfig.styles.find(style => style.id === id);
};

export const getCVStylesByDomain = (domain: string): CVStyle[] => {
  return cvConfig.styles.filter(style => style.domain === domain);
};

