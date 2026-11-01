import type { Certification } from '@/config';
import { CertificationsList, SectionHeader } from '@/components/documents/cv-template/primitives';

interface CVCertificationsSectionProps {
  certifications: Certification[];
  accentColor: string;
  sectionMarginBottom: string;
}

export default function CVCertificationsSection({ certifications, accentColor, sectionMarginBottom }: CVCertificationsSectionProps) {
  return (
    <section className="mb-4" style={{ marginBottom: sectionMarginBottom }}>
      <SectionHeader accentColor={accentColor}>CERTIFICATIONS</SectionHeader>
      <CertificationsList certifications={certifications} accentColor={accentColor} />
    </section>
  );
}
