import type { Language } from '@/config';
import { getProficiencyDisplay } from '@/lib/cv-helpers';
import { SectionHeader } from './primitives';

interface CVLanguagesSectionProps {
  languages: Language[];
  accentColor: string;
  sectionMarginBottom: string;
}

export default function CVLanguagesSection({ languages, accentColor, sectionMarginBottom }: CVLanguagesSectionProps) {
  return (
    <section className="mb-4" style={{ marginBottom: sectionMarginBottom }}>
      <SectionHeader accentColor={accentColor}>LANGUAGES</SectionHeader>
      <div style={{ fontSize: '11pt', lineHeight: '1.5', color: '#1a1a1a' }}>
        {languages.map((lang, idx) => (
          <span key={lang.id}>
            <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>{lang.name}:</strong> {getProficiencyDisplay(lang)}
            {idx < languages.length - 1 ? '  |  ' : ''}
          </span>
        ))}
      </div>
    </section>
  );
}
