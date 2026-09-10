import { SectionHeader } from './primitives';

interface CVSummarySectionProps {
  text: string;
  accentColor: string;
}

export default function CVSummarySection({ text, accentColor }: CVSummarySectionProps) {
  return (
    <section className="mb-5" style={{ marginBottom: '12pt' }}>
      <SectionHeader accentColor={accentColor}>SUMMARY</SectionHeader>
      <p style={{ fontSize: '11pt', textAlign: 'justify', lineHeight: '1.6', marginBottom: '0', color: '#1a1a1a', textIndent: '0' }}>
        {text}
      </p>
    </section>
  );
}
