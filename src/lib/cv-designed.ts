import type { Certification, Experience, Hobby, Project, Skill } from '@/config';
import { formatTotalDuration } from '@/lib/cv-helpers';
import type { ContributionStats } from '@/lib/github-contributions';

export const INK = '#0f172a';
/** Page colour: warm off-white, not pure white. */
export const PAPER = '#fdfcf8';

export interface CVHighlight {
  value: string;
  label: string;
}

/** Numbers for the header strip, from the data. Zero ones are skipped. Role highlights come first. */
export function getCVHighlights(
  experience: Experience[],
  certifications: Certification[],
  projects: Project[],
  contributionStats: Record<string, ContributionStats | null>,
): CVHighlight[] {
  const mergedPRs = projects.reduce((sum, p) => sum + (contributionStats[p.id]?.mergedCount ?? 0), 0);
  const experienceLength = formatTotalDuration(experience);
  const roleHighlights = experience.flatMap((e) => (e.cvHighlight ? [e.cvHighlight] : []));
  return [
    ...roleHighlights,
    experienceLength && { value: experienceLength, label: 'Professional experience' },
    mergedPRs > 0 && { value: String(mergedPRs), label: 'Merged open-source PRs' },
    certifications.length > 0 && { value: String(certifications.length), label: 'Certifications' },
  ].filter((h): h is CVHighlight => Boolean(h));
}

/** Pulls the named core skills out of the categories, in the order given. Missing names are skipped. */
export function splitCoreSkills(skills: Record<string, Skill[]>, coreNames: string[] = []): { core: Skill[]; rest: Record<string, Skill[]> } {
  const all = Object.values(skills).flat();
  const core = coreNames.flatMap((name) => all.filter((s) => s.name === name));
  const coreSet = new Set(core.map((s) => s.name));
  const rest = Object.fromEntries(
    Object.entries(skills)
      .map(([category, list]) => [category, list.filter((s) => !coreSet.has(s.name))] as const)
      .filter(([, list]) => list.length > 0),
  );
  return { core, rest };
}

/** Professional interests (what I'm studying) and personal ones (outside work). */
export const splitInterests = (hobbies: Hobby[]) => ({
  studying: hobbies.filter((h) => h.kind !== 'personal'),
  outside: hobbies.filter((h) => h.kind === 'personal'),
});

/** A project with its own website (not just a GitHub repo) gets a LIVE tag. */
export const isLiveProject = (project: Project): boolean => Boolean(project.link && !/github\.com/.test(project.link));
