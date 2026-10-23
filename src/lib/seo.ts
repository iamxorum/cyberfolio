import type { Metadata } from 'next';
import { education, experience, getTopSkills, siteConfig } from '@/config';
import { isOngoingEnd } from '@/lib/cv-helpers';

export const siteUrl = `https://${siteConfig.domain}`;

interface PageMetadataOptions {
  path: string;
  title: string;
  description: string;
  alternates?: Metadata['alternates'];
  robots?: Metadata['robots'];
}

/** Metadata for a static page that uses the site-wide social card. */
export function pageMetadata({ path, title, description, alternates, robots }: PageMetadataOptions): Metadata {
  const url = `${siteUrl}${path}`;
  const images = [`${siteUrl}/opengraph-image`];

  return {
    title,
    description,
    alternates: { canonical: url, ...alternates },
    openGraph: { title, description, url, images },
    twitter: { title, description, images },
    ...(robots && { robots }),
  };
}

/** BreadcrumbList for `trail` (paths are site-relative), starting from Home. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '' }, ...trail].map(({ name, path }, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name,
      item: `${siteUrl}${path}`,
    })),
  };
}

export const personId = `${siteUrl}/#person`;

/** The site owner as schema.org Person. Emitted once site-wide; other pages reference it by `@id`. */
export function personJsonLd() {
  const currentRole = experience.find((exp) => isOngoingEnd(exp.endDate));

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId,
    name: siteConfig.fullName,
    alternateName: siteConfig.username,
    url: siteUrl,
    jobTitle: siteConfig.role,
    description: siteConfig.description,
    sameAs: (siteConfig.social.professional || []).filter((link) => link.showInFooter).map((link) => link.url),
    ...(currentRole && { worksFor: { '@type': 'Organization', name: currentRole.company } }),
    ...(education.length > 0 && {
      alumniOf: education.map((edu) => ({ '@type': 'EducationalOrganization', name: edu.institution })),
    }),
    knowsAbout: getTopSkills(15).map((skill) => skill.name),
  };
}
