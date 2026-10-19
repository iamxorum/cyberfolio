'use client';

import { Document } from '@react-pdf/renderer';
import { CVPage } from '@/components/CVDocument';
import { cvMetadata } from '@/lib/pdf-metadata';
import { CoverLetterPage } from '@/components/CoverLetterDocument';
import type { CoverLetterStyle } from '@/config';
import type { ComponentProps } from 'react';

interface ApplicationDocumentProps {
  cv: ComponentProps<typeof CVPage>;
  letterStyle: CoverLetterStyle;
}

/** One PDF for an application: the cover letter first, then the CV. */
export default function ApplicationDocument({ cv, letterStyle }: ApplicationDocumentProps) {
  const { siteConfig, email, phone } = cv;

  return (
    <Document {...cvMetadata(cv.style, siteConfig)} title={`Application | ${siteConfig.fullName} - ${cv.style.name}`}>
      <CoverLetterPage siteConfig={siteConfig} style={letterStyle} email={email} phone={phone} />
      <CVPage {...cv} />
    </Document>
  );
}
