import type { Education, SiteConfig } from '@/config';
import { stripUrl, formatDateRange } from '@/lib/cv-helpers';
import { SectionHeader } from './primitives';

interface CVEducationSectionProps {
  education: Education[];
  siteConfig: SiteConfig;
  accentColor: string;
  sectionMarginBottom: string;
}

export default function CVEducationSection({ education, siteConfig, accentColor, sectionMarginBottom }: CVEducationSectionProps) {
  return (
    <section className="mb-4" style={{ marginBottom: sectionMarginBottom }}>
      <SectionHeader accentColor={accentColor}>EDUCATION</SectionHeader>
      {education.map((edu) => (
        <div key={edu.id} className="mb-4" style={{ marginBottom: '7pt', pageBreakInside: 'avoid' }}>
          <div style={{ marginBottom: '2pt' }}>
            <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2pt', color: '#000', letterSpacing: '0.1pt' }}>
              {edu.degree}
              {edu.field && `, ${edu.field}`}
            </h3>
            <div style={{ fontSize: '10.5pt', marginBottom: '2pt', color: '#1a1a1a' }}>
              {edu.institution}
              {edu.location && `, ${edu.location}`}
            </div>
            <div style={{ fontSize: '10pt', fontStyle: 'italic', color: '#3a3a3a', letterSpacing: '0.05pt' }}>
              {formatDateRange(edu.startDate, edu.endDate)}
              {edu.grade && ` | ${edu.grade}`}
            </div>
            {edu.thesisUrl && (
              <div style={{ fontSize: '10pt', color: '#3a3a3a', marginTop: '2pt' }}>
                <strong style={{ color: '#000' }}>Thesis:</strong> <a href={`https://${siteConfig.domain}${edu.thesisUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>View PDF</a> ({stripUrl(`https://${siteConfig.domain}${edu.thesisUrl}`)})
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  );
}
