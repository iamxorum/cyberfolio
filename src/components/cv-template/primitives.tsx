import type { Certification } from '@/config';

export const SkillsList = ({ skills }: { skills: Record<string, { name: string }[]> }) => (
  <>
    {Object.entries(skills).map(([category, categorySkills]) => (
      <p key={category} style={{ fontSize: '10.5pt', lineHeight: '1.4', marginBottom: '2pt', color: '#1a1a1a', letterSpacing: '0.05pt' }}>
        <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>{category}: </strong>
        {categorySkills.map((skill, idx) => (
          <span key={skill.name}>
            {skill.name}
            {idx < categorySkills.length - 1 ? ', ' : ''}
          </span>
        ))}
      </p>
    ))}
  </>
);

export const CertificationsList = ({ certifications, accentColor }: { certifications: Certification[]; accentColor: string }) => (
  <>
    {certifications.map((cert) => (
      <p key={cert.id} style={{ fontSize: '11pt', lineHeight: '1.35', marginBottom: '2pt', color: '#1a1a1a', letterSpacing: '0.05pt' }}>
        <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>{cert.name}</strong>
        {' - '}
        <span style={{ color: accentColor }}>{cert.issuer}</span>
        {' | '}
        <span style={{ fontSize: '10pt', fontStyle: 'italic', color: '#3a3a3a' }}>
          {cert.issueDate}{cert.expiryDate && ` - ${cert.expiryDate}`}
        </span>
      </p>
    ))}
  </>
);

export const SectionHeader = ({ children, accentColor }: { children: string; accentColor: string }) => (
  <h2 className="mb-4" style={{
    fontSize: '14pt',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: '6pt',
    paddingBottom: '4pt',
    borderBottom: `2pt solid ${accentColor}`,
    letterSpacing: '0.8pt',
    color: accentColor,
  }}>
    {children}
  </h2>
);
