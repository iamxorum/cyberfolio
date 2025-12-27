export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate?: string; 
  description?: string;
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  type2?: string; 
  icon?: string;
  skills?: string[];
}

export const experience: Experience[] = [
  {
    id: 'exp_1',
    company: 'Example Company',
    role: 'Software Engineer',
    startDate: 'Jan 2023',
    endDate: 'Present',
    description: 'Description of your role and responsibilities.',
    location: 'Remote',
    type: 'full-time',
    type2: 'Employment',
    icon: 'work',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
  },
];
