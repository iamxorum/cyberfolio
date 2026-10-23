export interface Experience {
  id: string;
  company: string;
  role: string;
  /** Free text, shown as written (e.g. "Jan 2023"). */
  startDate: string;
  /** Omit, or use "Present", for a current role. */
  endDate?: string;
  description?: string;
  plainSummary?: string;
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  /** Second label next to `type` (e.g. "Employment"). */
  type2?: string;
  icon?: string;
  /** Square logo path under /public (e.g. "/logos/acme.png"), shown next to the company name (24px). */
  logo?: string;
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
