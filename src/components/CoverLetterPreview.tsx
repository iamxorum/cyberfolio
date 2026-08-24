'use client';

import { CoverLetterStyle, SiteConfig } from '@/config';
import { getContactInfo } from '@/lib/cv-helpers';

interface CoverLetterPreviewProps {
  siteConfig: SiteConfig;
  style: CoverLetterStyle;
  email?: string;
}

export default function CoverLetterPreview({ siteConfig, style, email }: CoverLetterPreviewProps) {
  const contactInfo = getContactInfo(siteConfig, email);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const accentColor = style.colorScheme?.primary || '#000000';
  const salutation = style.salutation || 'Dear Hiring Manager,';

  return (
    <div className="cover-letter-template ats-friendly bg-white text-black" style={{ fontFamily: 'Times New Roman, serif', fontSize: '11pt', lineHeight: '1.5' }}>
      <div style={{ marginBottom: '18pt', paddingBottom: '10pt', borderBottom: `2.5pt solid ${accentColor}` }}>
        <h1 style={{ fontSize: '20pt', fontWeight: 'bold', marginBottom: '3pt', letterSpacing: '0.8pt', color: accentColor }}>
          {siteConfig.fullName}
        </h1>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '11pt', letterSpacing: '0.2pt', marginBottom: '6pt', color: accentColor }}>
          {'> '}{style.name}
        </div>
        {[contactInfo.personal, contactInfo.links].map((group, groupIdx) => group.length > 0 && (
          <div key={groupIdx} style={{ fontSize: '10.5pt', color: '#4a4a4a', letterSpacing: '0.1pt', marginTop: groupIdx > 0 ? '2pt' : 0 }}>
            {group.map((item, idx) => (
              <span key={item.text}>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{item.text}</a>
                ) : item.text}
                {idx < group.length - 1 ? ' | ' : ''}
              </span>
            ))}
          </div>
        ))}
      </div>

      <p style={{ marginBottom: '16pt' }}>{today}</p>
      <p style={{ marginBottom: '12pt' }}>{salutation}</p>
      <p style={{ marginBottom: '12pt', textAlign: 'justify' }}>{style.opening}</p>
      {style.body.map((paragraph, idx) => (
        <p key={idx} style={{ marginBottom: '12pt', textAlign: 'justify' }}>{paragraph}</p>
      ))}
      <p style={{ marginBottom: '12pt', textAlign: 'justify' }}>{style.closing}</p>

      <p style={{ marginTop: '8pt' }}>Sincerely,</p>
      <p style={{ marginTop: '24pt', fontWeight: 'bold', color: accentColor }}>{siteConfig.fullName}</p>
    </div>
  );
}
