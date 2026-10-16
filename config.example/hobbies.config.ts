export interface Hobby {
  name: string;
  description?: string;
  icon?: string;
  kind?: 'professional' | 'personal';
}

export const isPersonalHobby = (hobby: Hobby) => hobby.kind === 'personal';

export const hobbies: Hobby[] = [
  { 
    name: 'Programming', 
    description: 'Love to code and build projects in my free time.', 
    icon: 'code',
    kind: 'professional',
  },
  {
    name: 'Music Production',
    description: 'Making beats on weekends.',
    icon: 'music_note',
    kind: 'personal',
  },
];
