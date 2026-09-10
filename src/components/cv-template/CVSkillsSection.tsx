import { SkillsList, SectionHeader } from './primitives';

interface CVSkillsSectionProps {
  title: string;
  skills: Record<string, { name: string }[]>;
  accentColor: string;
  sectionMarginBottom: string;
}

export default function CVSkillsSection({ title, skills, accentColor, sectionMarginBottom }: CVSkillsSectionProps) {
  return (
    <section className="mb-4" style={{ marginBottom: sectionMarginBottom }}>
      <SectionHeader accentColor={accentColor}>{title}</SectionHeader>
      <SkillsList skills={skills} />
    </section>
  );
}
