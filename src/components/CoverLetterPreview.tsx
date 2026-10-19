'use client';

import { useSyncExternalStore } from 'react';
import { formatLetterDate } from '@/lib/format-time';
import { CoverLetterStyle, SiteConfig } from '@/config';
import { getContactInfo } from '@/lib/cv-helpers';
import CVTemplateHeader from '@/components/cv-template/CVTemplateHeader';

// The date only exists client-side; the empty server snapshot avoids a hydration mismatch.
const noopSubscribe = () => () => {};

interface CoverLetterPreviewProps {
  siteConfig: SiteConfig;
  style: CoverLetterStyle;
  email?: string;
}

export default function CoverLetterPreview({ siteConfig, style, email }: CoverLetterPreviewProps) {
  const contactInfo = getContactInfo(siteConfig, email);
  const today = useSyncExternalStore(noopSubscribe, () => formatLetterDate(), () => '');
  const accentColor = style.colorScheme?.primary || '#000000';
  const salutation = style.salutation || 'Dear Hiring Manager,';

  return (
    <div className="cover-letter-template ats-friendly bg-white text-black" style={{ fontFamily: 'Times New Roman, serif', fontSize: '11pt', lineHeight: '1.4' }}>
      <CVTemplateHeader siteConfig={siteConfig} role={style.name} accentColor={accentColor} contactInfo={contactInfo} />

      <div style={{ padding: '14pt 0.35in 0' }}>
        <p style={{ marginBottom: '16pt' }}>{today}</p>
        <p style={{ marginBottom: '12pt' }}>{salutation}</p>
        <p style={{ marginBottom: '12pt', textAlign: 'justify' }}>{style.opening}</p>
        {style.body.map((paragraph) => (
          <p key={paragraph} style={{ marginBottom: '12pt', textAlign: 'justify' }}>{paragraph}</p>
        ))}
        <p style={{ marginBottom: '12pt', textAlign: 'justify' }}>{style.closing}</p>

        <p style={{ marginTop: '8pt' }}>Sincerely,</p>
        <p style={{ marginTop: '24pt', fontWeight: 'bold', color: accentColor }}>{siteConfig.fullName}</p>
      </div>
    </div>
  );
}
