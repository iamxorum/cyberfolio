export interface Project {
  id: string;
  name: string;
  description: string;
  /** Shorter text for the CV. Falls back to `description`. */
  cvDescription?: string;
  status: 'DEPLOYED' | 'BETA' | 'ONLINE' | 'AUDITING' | 'DEVELOPMENT' | 'COMPLETED' | Array<'DEPLOYED' | 'BETA' | 'ONLINE' | 'AUDITING' | 'DEVELOPMENT' | 'COMPLETED'>;
  /** One colour per status when `status` is a list. */
  statusColor: 'green' | 'yellow' | 'blue' | 'orange' | 'red' | Array<'green' | 'yellow' | 'blue' | 'orange' | 'red'>;
  /** Label shown on the card, e.g. `MASTER_THESIS`. */
  type: string;
  tags: string[];
  icon: string;
  /** `private` projects are listed but get no page and are left off the CV. */
  visibility: 'public' | 'private';
  category: 'production' | 'thesis' | 'personal' | 'open-source' | 'commercial' | 'academic';
  /** `contribution` projects are listed under "Contributions" with merged PR counts. */
  projectType: 'personal' | 'contribution';
  link?: string;
  repository?: string;
  /** Default true. */
  includeInCV?: boolean;
}

export const projects: Project[] = [
  {
    id: 'example-project',
    name: 'Example Project',
    description: 'A sample project description. Replace this with your own project details.',
    status: 'ONLINE',
    statusColor: 'green',
    type: 'PORTFOLIO',
    tags: ['REACT', 'TYPESCRIPT', 'NEXT.JS'],
    icon: 'terminal',
    visibility: 'public',
    category: 'open-source',
    projectType: 'personal', 
    link: 'https://github.com/yourusername/example-project',
    repository: 'https://github.com/yourusername/example-project',
  },
];
