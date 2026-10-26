export interface CVStyle {
  id: string;
  name: string;
  description: string;
  /** Groups styles by role; see `getCVStylesByDomain`. */
  domain: string;
  icon: string;
  /** Replaces `CVConfig.summary` for this style. */
  summary?: string;
  /** Skill categories to show. Omit to show all. */
  skillCategories?: string[];
  /** Skill names to leave out of this style. */
  excludeSkills?: string[];
  /** Default true. */
  showProjects?: boolean;
  /** Default true. */
  showHobbies?: boolean;
}

export interface CVConfig {
  /** Round photo for the designed CV (not ATS). "/api/cv-photo" serves private/cv-photo.jpg. Omit for none. */
  photo?: string;
  /** Summary used when a style has none of its own. */
  summary?: string;
  styles: CVStyle[];
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
    },
  ],
};

export const getCVStyleById = (id: string): CVStyle | undefined => {
  return cvConfig.styles.find(style => style.id === id);
};

export const getCVStylesByDomain = (domain: string): CVStyle[] => {
  return cvConfig.styles.filter(style => style.domain === domain);
};

