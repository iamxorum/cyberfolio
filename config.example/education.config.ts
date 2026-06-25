export interface Education {
  id: string;
  institution: string;
  degree: string;
  field?: string;
  startDate: string; 
  endDate?: string; 
  description?: string;
  grade?: string;
  location?: string;
  icon?: string; 
  thesisUrl?: string; 
  thesisLabel?: string;
  thesisFileName?: string;
}

export const education: Education[] = [
  {
    id: 'edu_1',
    institution: 'Example University',
    degree: 'Bachelor\'s Degree',
    field: 'Computer Science',
    startDate: 'September 2020',
    endDate: 'June 2024',
    description: 'Description of your degree program',
    location: 'City, Country',
    grade: '3.8/4.0',
    icon: 'school',
    thesisUrl: '/api/docs/edu_2',
    thesisLabel: 'VIEW_THESIS',
    thesisFileName: 'edu_2_thesis.pdf',
  },
];
