'use client';

import { View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import type { ContactGroups, ContactItem } from '@/lib/cv-helpers';

const styles = StyleSheet.create({
  header: {
    marginBottom: 10,
    paddingBottom: 7,
    borderBottomWidth: 2.5,
  },
  name: {
    fontFamily: 'Times-Bold',
    fontSize: 21,
    letterSpacing: 0.8,
    marginBottom: 5,
  },
  roleTagline: {
    fontFamily: 'Courier-Bold',
    fontSize: 11.5,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  contactLine: {
    fontSize: 10.5,
    color: '#4a4a4a',
    letterSpacing: 0.1,
    lineHeight: 1.3,
  },
});

const ContactLine = ({ items, marginTop = 0 }: { items: ContactItem[]; marginTop?: number }) => items.length > 0 && (
  <Text style={[styles.contactLine, { marginTop }]}>
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

interface DocumentHeaderProps {
  name: string;
  /** The role line under the name. */
  role: string;
  accentColor: string;
  contactInfo: ContactGroups;
}

/** Name, role and contact lines at the top of a PDF page. The CV and the cover letter share it so they read as a set. */
export default function DocumentHeader({ name, role, accentColor, contactInfo }: DocumentHeaderProps) {
  return (
    <View style={[styles.header, { borderBottomColor: accentColor }]}>
      <Text style={[styles.name, { color: accentColor }]}>{name}</Text>
      <Text style={[styles.roleTagline, { color: accentColor }]}>{role}</Text>
      <ContactLine items={contactInfo.personal} />
      <ContactLine items={contactInfo.links} marginTop={2} />
    </View>
  );
}
