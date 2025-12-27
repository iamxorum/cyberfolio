export interface Hobby {
  name: string;
  description?: string;
  icon?: string; 
}

export const hobbies: Hobby[] = [
  { 
    name: 'Programming', 
    description: 'Love to code and build projects in my free time.', 
    icon: 'code' 
  },
];
