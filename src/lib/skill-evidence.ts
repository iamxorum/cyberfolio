import { experience, projects, type Experience, type Project } from '@/config';

/**
 * Real overlaps between skills.config's `name` and experience/project tag strings
 * aren't always exact text matches (e.g. skill "Apache Hive" vs experience tag
 * "Hive"). Rather than fuzzy/substring matching — which would also create false
 * positives like "Git" matching inside "GitHub Copilot" — known real aliases are
 * listed explicitly here. No match falls back to no evidence, never a guess.
 */
const SKILL_ALIASES: Record<string, string[]> = {
  'Apache Hive': ['Hive'],
  'Apache Impala': ['Impala'],
  React: ['React.js'],
  'MinIO (S3)': ['MinIO'],
  'Tailwind CSS': ['Tailwind', 'TAILWIND'],
  Firewalls: ['IPTables Firewall'],
  Jenkins: ['Jenkins CI/CD'],
};

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function namesMatch(skillName: string, candidate: string): boolean {
  if (normalize(skillName) === normalize(candidate)) return true;
  const aliases = SKILL_ALIASES[skillName] ?? [];
  return aliases.some((alias) => normalize(alias) === normalize(candidate));
}

export interface SkillEvidence {
  experience: Experience[];
  projects: Project[];
}

export function getSkillEvidence(skillName: string): SkillEvidence {
  return {
    experience: experience.filter((exp) => (exp.skills ?? []).some((s) => namesMatch(skillName, s))),
    projects: projects.filter((project) => project.tags.some((t) => namesMatch(skillName, t))),
  };
}
