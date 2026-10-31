import type { Hobby } from '@/config';
import { splitInterests } from '@/lib/cv-designed';
import { SectionHeader } from './primitives';

interface CVAdditionalInfoSectionProps {
  hobbies: Hobby[];
  accentColor: string;
  sectionMarginBottom: string;
}

const lineStyle = { fontSize: '11pt', lineHeight: '1.6', color: '#1a1a1a' } as const;

export default function CVAdditionalInfoSection({ hobbies, accentColor, sectionMarginBottom }: CVAdditionalInfoSectionProps) {
  const { studying, outside } = splitInterests(hobbies);
  return (
    <section className="mb-4" style={{ marginBottom: sectionMarginBottom }}>
      <SectionHeader accentColor={accentColor}>INTERESTS</SectionHeader>
      {studying.length > 0 && (
        <div style={lineStyle}>
          <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>Studying:</strong> {studying.map((h) => h.name).join(', ')}
        </div>
      )}
      {outside.length > 0 && (
        <div style={lineStyle}>
          <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>Outside work:</strong> {outside.map((h) => h.name).join(', ')}
        </div>
      )}
    </section>
  );
}
