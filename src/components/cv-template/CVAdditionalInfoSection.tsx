import type { Hobby } from '@/config';
import { SectionHeader } from './primitives';

interface CVAdditionalInfoSectionProps {
  hobbies: Hobby[];
  accentColor: string;
  sectionMarginBottom: string;
}

export default function CVAdditionalInfoSection({ hobbies, accentColor, sectionMarginBottom }: CVAdditionalInfoSectionProps) {
  return (
    <section className="mb-4" style={{ marginBottom: sectionMarginBottom }}>
      <SectionHeader accentColor={accentColor}>ADDITIONAL INFORMATION</SectionHeader>
      <div style={{ fontSize: '11pt', lineHeight: '1.6', color: '#1a1a1a' }}>
        <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>Interests:</strong> {hobbies.map((hobby, idx) => (
          <span key={idx}>
            {hobby.name}
            {idx < hobbies.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
    </section>
  );
}
