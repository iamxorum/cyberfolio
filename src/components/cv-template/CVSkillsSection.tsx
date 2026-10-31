import { SkillsList, SectionHeader } from './primitives';

interface CVSkillsSectionProps {
  title: string;
  skills: Record<string, { name: string }[]>;
  /** Beginner-level skills, shown on one "Familiar with" line. */
  familiar?: { name: string }[];
  accentColor: string;
  sectionMarginBottom: string;
}

export default function CVSkillsSection({ title, skills, familiar = [], accentColor, sectionMarginBottom }: CVSkillsSectionProps) {
  return (
    <section className="mb-4" style={{ marginBottom: sectionMarginBottom }}>
      <SectionHeader accentColor={accentColor}>{title}</SectionHeader>
      <SkillsList skills={skills} />
      {familiar.length > 0 && (
        <p style={{ fontSize: '10.5pt', lineHeight: '1.4', marginBottom: '2pt', color: '#1a1a1a', letterSpacing: '0.05pt' }}>
          <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>Familiar with: </strong>
          {familiar.map((s) => s.name).join(', ')}
        </p>
      )}
    </section>
  );
}
