export interface Language {
  id: string;
  name: string;
  /** ISO 3166-1 alpha-2 code, picks the flag. */
  countryCode: string;
  /** Overall level, e.g. "Native (C2)". */
  proficiency?: string;
  spoken?: string;
  written?: string;
  listening?: string;
  /** Default true. */
  includeInCV?: boolean;
}

export const languages: Language[] = [
  {
    id: 'lang_1',
    name: 'English',
    countryCode: 'us',
    proficiency: 'Fluent',
    spoken: 'C1',
    written: 'C1',
    listening: 'C1',
  },
];
