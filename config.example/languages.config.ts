export interface Language {
  id: string;
  name: string;
  countryCode: string;
  proficiency?: string;
  spoken?: string;
  written?: string;
  listening?: string;
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
