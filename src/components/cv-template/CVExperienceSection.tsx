import type { Experience } from '@/config';
import { formatDateRange, getCVStack } from '@/lib/cv-helpers';
import { SectionHeader } from './primitives';

interface CVExperienceSectionProps {
  experience: Experience[];
  accentColor: string;
}

const RoleDetails = ({ exp }: { exp: Experience }) => {
  const { intro, bullets: points = [] } = exp;
  const stack = getCVStack(exp);
  return (
    <>
      {intro && <p style={{ fontSize: '11pt', lineHeight: '1.4', color: '#1a1a1a', margin: '1pt 0 0' }}>{intro}</p>}
      {points.length > 0 && (
        <ul style={{ marginLeft: '16pt', marginTop: '4pt', paddingLeft: '16pt', listStyleType: 'disc' }}>
          {points.map((point, pointIdx) => (
            <li key={pointIdx} style={{ fontSize: '11pt', lineHeight: '1.5', marginBottom: '2.5pt', textAlign: 'left', color: '#1a1a1a', paddingRight: '4pt' }}>
              {point}
            </li>
          ))}
        </ul>
      )}
      {stack.length > 0 && (
        <div style={{ marginTop: '5pt', fontSize: '10.5pt', fontStyle: 'italic', marginLeft: '16pt', color: '#3a3a3a', paddingRight: '4pt' }}>
          <strong style={{ fontStyle: 'normal', color: '#000' }}>Technologies:</strong> {stack.join(', ')}
        </div>
      )}
    </>
  );
};

export default function CVExperienceSection({ experience, accentColor }: CVExperienceSectionProps) {
  return (
    <section className="mb-5" style={{ marginBottom: '12pt' }}>
      <SectionHeader accentColor={accentColor}>EXPERIENCE</SectionHeader>
      {experience.map((exp) => (
        <div key={exp.id} className="mb-5" style={{ marginBottom: '10pt', pageBreakInside: 'avoid' }}>
          <div className="mb-3" style={{ marginBottom: '4pt' }}>
            <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2pt', color: '#000', lineHeight: '1.3', letterSpacing: '0.1pt' }}>
              {exp.role}, <span style={{ color: accentColor }}>{exp.company}</span>
              {exp.location && `, ${exp.location}`}
            </h3>
            <div style={{ fontSize: '10.5pt', fontStyle: 'italic', color: '#2a2a2a', letterSpacing: '0.1pt' }}>
              {formatDateRange(exp.startDate, exp.endDate)}
            </div>
          </div>
          <RoleDetails exp={exp} />
        </div>
      ))}
    </section>
  );
}
