export type SkillLevel = 'informational' | 'beginner' | 'mid' | 'intermediate' | 'advanced' | 'expert';

export interface Skill {
  name: string;
  level: SkillLevel;
  category: string;
}

export const skillLevelRanges: Record<SkillLevel, { min: number; max: number; mid: number }> = {
  informational: { min: 0, max: 10, mid: 5 },
  beginner: { min: 10, max: 30, mid: 20 },
  mid: { min: 30, max: 50, mid: 40 },
  intermediate: { min: 50, max: 70, mid: 60 },
  advanced: { min: 70, max: 85, mid: 77 },
  expert: { min: 85, max: 100, mid: 92 },
};

export const getScoreFromLevel = (level: SkillLevel): number => {
  return skillLevelRanges[level].mid;
};

export const getScoreRangeFromLevel = (level: SkillLevel): { min: number; max: number } => {
  const range = skillLevelRanges[level];
  return { min: range.min, max: range.max };
};

export const skills: Skill[] = [
  { name: 'JavaScript', level: 'advanced', category: 'Frontend' },
  { name: 'React', level: 'intermediate', category: 'Frontend' },
  { name: 'Node.js', level: 'intermediate', category: 'Backend' },
  { name: 'TypeScript', level: 'intermediate', category: 'Backend' },
  { name: 'Python', level: 'intermediate', category: 'Backend' },
  { name: 'Docker', level: 'mid', category: 'DevOps' },
];


export const getTopSkills = (count: number = 6): Skill[] => {
  return [...skills]
    .sort((a, b) => getScoreFromLevel(b.level) - getScoreFromLevel(a.level))
    .slice(0, count);
};


export const getCategories = (): string[] => {
  const categories = new Set(skills.map(skill => skill.category));
  return Array.from(categories).sort();
};


export const getSkillsByCategory = (category: string): Skill[] => {
  return skills.filter(skill => skill.category === category);
};


export const getSkillsGroupedByCategory = (): Record<string, Skill[]> => {
  return skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);
};
