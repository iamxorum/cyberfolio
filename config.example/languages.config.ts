export interface Language {
  id: string;
  name: string;
  countryCode: string;
  proficiency?: string;
  spoken?: string;
  written?: string;
  listening?: string;
  /** Set to false to keep an entry off the CV/resume export while still showing it elsewhere (e.g. the About page). Defaults to true. */
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
