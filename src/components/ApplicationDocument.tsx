'use client';

import { Document } from '@react-pdf/renderer';
import { CVPage } from '@/components/CVDocument';
import { CVDesignedPage } from '@/components/CVDesignedDocument';
import type { CVVariant } from '@/components/cv/VariantToggle';
import { cvMetadata } from '@/lib/pdf-metadata';
import { CoverLetterPage } from '@/components/CoverLetterDocument';
import type { CoverLetterStyle } from '@/config';
import type { ComponentProps } from 'react';

interface ApplicationDocumentProps {
  cv: ComponentProps<typeof CVPage>;
  variant?: CVVariant;
  letterStyle: CoverLetterStyle;
  signature?: string;
}

/** Letter first, then the CV (ATS or designed). */
export default function ApplicationDocument({ cv, variant = 'ats', letterStyle, signature }: ApplicationDocumentProps) {
  const { siteConfig, email, phone } = cv;

  return (
    <Document {...cvMetadata(cv.style, siteConfig)} title={`Application | ${siteConfig.fullName} - ${cv.style.name}`}>
      <CoverLetterPage siteConfig={siteConfig} style={letterStyle} email={email} phone={phone} signature={signature} />
      {variant === 'designed' ? <CVDesignedPage {...cv} /> : <CVPage {...cv} />}
    </Document>
  );
}
