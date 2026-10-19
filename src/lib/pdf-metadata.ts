import type { CoverLetterStyle, CVStyle, SiteConfig } from '@/config';
import { getRelevantSkills } from '@/lib/cv-helpers';

function getCVKeywords(style: CVStyle): string {
  const { technicalSkills } = getRelevantSkills(style);
  return Array.from(new Set([
    style.domain,
    style.name,
    ...Object.values(technicalSkills).flat().map(s => s.name),
  ])).join(', ');
}

/** PDF metadata for a CV, shared by the CV-only and the combined application documents. */
export const cvMetadata = (style: CVStyle, siteConfig: SiteConfig) => ({
  title: `CV | ${siteConfig.fullName}`,
  author: siteConfig.fullName,
  subject: `${style.name} | CV`,
  keywords: getCVKeywords(style),
  creator: siteConfig.fullName,
  producer: siteConfig.fullName,
});

/** PDF metadata for a cover letter, shared by the letter-only and the combined application documents. */
export const coverLetterMetadata = (style: CoverLetterStyle, siteConfig: SiteConfig) => ({
  title: `Cover Letter | ${siteConfig.fullName} - ${style.name}`,
  author: siteConfig.fullName,
  subject: `Cover Letter | ${style.name}`,
  creator: siteConfig.fullName,
  producer: siteConfig.fullName,
});
