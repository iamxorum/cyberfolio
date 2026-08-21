import type { Metadata } from 'next';
import { siteConfig } from '@/config';
import CVClient from './CVClient';

const siteUrl = `https://${siteConfig.domain}`;
const pageUrl = `${siteUrl}/cv`;
const ogImage = `${siteUrl}/opengraph-image`;
const title = `CV — ${siteConfig.fullName}`;
const description = `Downloadable, ATS-optimized CV for ${siteConfig.fullName}, ${siteConfig.role}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: pageUrl },
  openGraph: { title, description, url: pageUrl, images: [ogImage] },
  twitter: { title, description, images: [ogImage] },
};

export default function CVPage() {
  return <CVClient />;
}
