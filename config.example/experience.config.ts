export interface Experience {
  id: string;
  company: string;
  role: string;
  /** Free text, shown as written (e.g. "Jan 2023"). */
  startDate: string;
  /** Omit, or use "Present", for a current role. */
  endDate?: string;
  /** One line under the role: what the job was. */
  intro?: string;
  /** One entry per bullet. */
  bullets?: string[];
  location?: string;
  type?: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
  /** Second label next to `type` (e.g. "Employment"). */
  type2?: string;
  icon?: string;
  /** Square logo path under /public (e.g. "/logos/acme.png"), shown next to the company name (24px). */
  logo?: string;
  skills?: string[];
  /** Shorter stack for the CV (about 10 items). Falls back to `skills`. */
  cvSkills?: string[];
  /** One big number for the designed CV's header strip (e.g. { value: 'Days to hours', label: 'Build time' }). */
  cvHighlight?: { value: string; label: string };
}

export const experience: Experience[] = [
  {
    id: 'exp_1',
    company: 'Example Company',
    role: 'Software Engineer',
    startDate: 'Jan 2023',
    endDate: 'Present',
    intro: 'What the role was, in one line.',
    bullets: [
      'What you did, what it changed, and how you did it.',
    ],
    location: 'Remote',
    type: 'full-time',
    type2: 'Employment',
    icon: 'work',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
  },
];
