export interface CoverLetterStyle {
  id: string;
  name: string;
  description: string;
  domain: string;
  icon: string;
  /**
   * The CV style this letter goes with. Defaults to this letter's own `id`.
   * A CV style with a paired letter gets the "CV + LETTER" download; one without doesn't.
   */
  cvStyleId?: string;
  /** Default "Dear Hiring Manager,". */
  salutation?: string;
  opening: string;
  /** One entry per paragraph. */
  body: string[];
  closing: string;
  colorScheme?: {
    primary: string;
    secondary?: string;
  };
}

export interface CoverLetterConfig {
  styles: CoverLetterStyle[];
}

export const coverLetterConfig: CoverLetterConfig = {
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

/** The cover letter that pairs with a CV style, if there is one. */
export const getCoverLetterForCV = (cvStyleId: string): CoverLetterStyle | undefined =>
  coverLetterConfig.styles.find(style => (style.cvStyleId ?? style.id) === cvStyleId);

export const getCoverLetterStyleById = (id: string): CoverLetterStyle | undefined =>
  coverLetterConfig.styles.find(style => style.id === id);
