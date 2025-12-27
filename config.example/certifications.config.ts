export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string; 
  expiryDate?: string; 
  credentialId?: string; 
  credentialUrl?: string; 
  description?: string;
  icon?: string; 
}

export const certifications: Certification[] = [
  {
    id: 'cert_1',
    name: 'Example Certification',
    issuer: 'Certification Provider',
    issueDate: 'Jan 2024',
    expiryDate: 'Jan 2025',
    credentialId: 'CERT-123456',
    credentialUrl: 'https://example.com/verify/CERT-123456',
    description: 'Description of your certification',
    icon: 'verified',
  },
];
