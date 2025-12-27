export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'DEPLOYED' | 'BETA' | 'ONLINE' | 'AUDITING' | 'DEVELOPMENT' | 'COMPLETED' | Array<'DEPLOYED' | 'BETA' | 'ONLINE' | 'AUDITING' | 'DEVELOPMENT' | 'COMPLETED'>;
  statusColor: 'green' | 'yellow' | 'blue' | 'orange' | 'red' | Array<'green' | 'yellow' | 'blue' | 'orange' | 'red'>;
  type: string;
  tags: string[];
  icon: string; 
  visibility: 'public' | 'private'; 
  category: 'production' | 'thesis' | 'personal' | 'open-source' | 'commercial' | 'academic'; 
  link?: string;
  repository?: string;
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
    link: 'https://github.com/yourusername/example-project',
    repository: 'https://github.com/yourusername/example-project',
  },
];
