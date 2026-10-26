import type { Certification, Experience, Project, Skill } from '@/config';
import { formatTotalDuration } from '@/lib/cv-helpers';
import type { ContributionStats } from '@/lib/github-contributions';

export const INK = '#0f172a';
/** Page colour: warm off-white, not pure white. */
export const PAPER = '#fdfcf8';

export interface CVHighlight {
  value: string;
  label: string;
}

/** Numbers for the header strip, from the data. Zero ones are skipped. */
export function getCVHighlights(
  experience: Experience[],
  certifications: Certification[],
  projects: Project[],
  contributionStats: Record<string, ContributionStats | null>,
): CVHighlight[] {
  const mergedPRs = projects.reduce((sum, p) => sum + (contributionStats[p.id]?.mergedCount ?? 0), 0);
  const experienceLength = formatTotalDuration(experience);
  return [
    experienceLength && { value: experienceLength, label: 'Hands-on experience' },
    mergedPRs > 0 && { value: String(mergedPRs), label: 'Merged open-source PRs' },
    certifications.length > 0 && { value: String(certifications.length), label: 'Certifications' },
  ].filter((h): h is CVHighlight => Boolean(h));
}

/** Solid chips: intermediate and up. */
export const isStrongSkill = (skill: Skill): boolean => ['intermediate', 'advanced', 'expert'].includes(skill.level);
