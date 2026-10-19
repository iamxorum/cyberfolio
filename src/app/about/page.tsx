import { siteConfig } from '@/config';
import AboutClient from './AboutClient';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, pageMetadata, personId, siteUrl } from '@/lib/seo';

export const metadata = pageMetadata({
  path: '/about',
  title: `About | ${siteConfig.fullName}`,
  description: `${siteConfig.role} | background, projects, skills, education, and certifications.`,
});

const breadcrumbs = breadcrumbJsonLd([{ name: 'About', path: '/about' }]);

// The Person itself is declared site-wide in the root layout; this page says it is that person's profile.
const profilePage = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  url: `${siteUrl}/about`,
  name: `About ${siteConfig.fullName}`,
  mainEntity: { '@id': personId },
};

export default function About() {
  return (
    <>
      <JsonLd data={breadcrumbs} />
      <JsonLd data={profilePage} />
      <AboutClient />
    </>
  );
}
