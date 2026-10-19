'use client';

import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { CoverLetterStyle, SiteConfig } from '@/config';
import { formatLetterDate } from '@/lib/format-time';
import DocumentHeader from '@/components/pdf/DocumentHeader';
import { getContactInfo } from '@/lib/cv-helpers';
import { coverLetterMetadata } from '@/lib/pdf-metadata';

interface CoverLetterDocumentProps {
  siteConfig: SiteConfig;
  style: CoverLetterStyle;
  email?: string;
}

const styles = StyleSheet.create({
  // Same page, font and margins as the CV, so the two read as one set.
  page: {
    padding: '0.4in',
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.3,
    color: '#000000',
  },
  // The letter body is inset a little: full-width lines are tiring to read in prose.
  body: {
    paddingHorizontal: '0.35in',
    paddingTop: 14,
  },
  date: {
    fontSize: 11,
    marginBottom: 16,
  },
  salutation: {
    fontSize: 11,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 11,
    textAlign: 'justify',
    lineHeight: 1.5,
    marginBottom: 12,
  },
  signOff: {
    fontSize: 11,
    marginTop: 8,
  },
  signName: {
    fontFamily: 'Times-Bold',
    fontSize: 11,
    marginTop: 24,
  },
});

export function CoverLetterPage({ siteConfig, style, email }: CoverLetterDocumentProps) {
  const contactInfo = getContactInfo(siteConfig, email);
  const today = formatLetterDate();
  const accentColor = style.colorScheme?.primary || '#000000';
  const salutation = style.salutation || 'Dear Hiring Manager,';

  return (
    <Page size="A4" style={styles.page} wrap>
      <DocumentHeader name={siteConfig.fullName} role={style.name} accentColor={accentColor} contactInfo={contactInfo} />

      <View style={styles.body}>
        <Text style={styles.date}>{today}</Text>
        <Text style={styles.salutation}>{salutation}</Text>
        <Text style={styles.paragraph}>{style.opening}</Text>
        {style.body.map((paragraph) => (
          <Text key={paragraph} style={styles.paragraph}>{paragraph}</Text>
        ))}
        <Text style={styles.paragraph}>{style.closing}</Text>

        <Text style={styles.signOff}>Sincerely,</Text>
        <Text style={[styles.signName, { color: accentColor }]}>{siteConfig.fullName}</Text>
      </View>
    </Page>
  );
}

export default function CoverLetterDocument(props: CoverLetterDocumentProps) {
  return (
    <Document {...coverLetterMetadata(props.style, props.siteConfig)}>
      <CoverLetterPage {...props} />
    </Document>
  );
}
