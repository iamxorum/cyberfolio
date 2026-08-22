'use client';

import { Document, Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import { CoverLetterStyle, SiteConfig } from '@/config';
import { getContactInfo, type ContactItem } from '@/lib/cv-helpers';

interface CoverLetterDocumentProps {
  siteConfig: SiteConfig;
  style: CoverLetterStyle;
  email?: string;
}

const styles = StyleSheet.create({
  page: {
    padding: '0.75in',
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#000000',
  },
  header: {
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 2.5,
    borderBottomColor: '#000000',
  },
  name: {
    fontFamily: 'Times-Bold',
    fontSize: 20,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  contactLine: {
    fontSize: 10.5,
    color: '#4a4a4a',
    letterSpacing: 0.1,
    lineHeight: 1.3,
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

const ContactLine = ({ items }: { items: ContactItem[] }) => items.length > 0 && (
  <Text style={styles.contactLine}>
    {items.map((item, idx) => (
      <Text key={item.text}>
        {item.href ? (
          <Link src={item.href} style={{ color: '#4a4a4a', textDecoration: 'none' }}>{item.text}</Link>
        ) : item.text}
        {idx < items.length - 1 ? ' | ' : ''}
      </Text>
    ))}
  </Text>
);

export default function CoverLetterDocument({ siteConfig, style, email }: CoverLetterDocumentProps) {
  const contactInfo = getContactInfo(siteConfig, email);
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const accentColor = style.colorScheme?.primary || '#000000';
  const salutation = style.salutation || 'Dear Hiring Manager,';

  return (
    <Document
      title={`Cover Letter — ${siteConfig.fullName} — ${style.name}`}
      author={siteConfig.fullName}
      subject={`Cover Letter — ${style.name}`}
      creator={siteConfig.fullName}
      producer={siteConfig.fullName}
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={[styles.header, { borderBottomColor: accentColor }]}>
          <Text style={[styles.name, { color: accentColor }]}>{siteConfig.fullName}</Text>
          <ContactLine items={contactInfo.personal} />
          <ContactLine items={contactInfo.links} />
        </View>

        <Text style={styles.date}>{today}</Text>
        <Text style={styles.salutation}>{salutation}</Text>
        <Text style={styles.paragraph}>{style.opening}</Text>
        {style.body.map((paragraph, idx) => (
          <Text key={idx} style={styles.paragraph}>{paragraph}</Text>
        ))}
        <Text style={styles.paragraph}>{style.closing}</Text>

        <Text style={styles.signOff}>Sincerely,</Text>
        <Text style={[styles.signName, { color: accentColor }]}>{siteConfig.fullName}</Text>
      </Page>
    </Document>
  );
}
