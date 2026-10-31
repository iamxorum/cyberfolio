/** beginner (used it), working (comfortable day to day), proficient (go-to tool), advanced (could teach it). Rate honestly: proficient and advanced are there to grow into. */
export type SkillLevel = 'beginner' | 'working' | 'proficient' | 'advanced';

export interface Skill {
  name: string;
  level: SkillLevel;
  category: string;
}

const skillLevelRanges: Record<SkillLevel, { min: number; max: number; mid: number }> = {
  beginner: { min: 10, max: 30, mid: 20 },
  working: { min: 30, max: 50, mid: 40 },
  proficient: { min: 50, max: 70, mid: 60 },
  advanced: { min: 70, max: 85, mid: 77 },
};

export const getScoreFromLevel = (level: SkillLevel): number => {
  return skillLevelRanges[level].mid;
};

export const skills: Skill[] = [
  { name: 'JavaScript', level: 'working', category: 'Frontend' },
  { name: 'React', level: 'working', category: 'Frontend' },
  { name: 'Node.js', level: 'working', category: 'Backend' },
  { name: 'TypeScript', level: 'working', category: 'Backend' },
  { name: 'Python', level: 'working', category: 'Backend' },
  { name: 'Docker', level: 'working', category: 'DevOps' },
];


/** Shown first among skills with the same level (the radar and the top-skills list). */
const featuredSkills = ['Linux', 'Bash', 'Python', 'Docker', 'Zabbix', 'PostgreSQL'];
const featuredRank = (skill: Skill) => {
  const i = featuredSkills.indexOf(skill.name);
  return i === -1 ? featuredSkills.length : i;
};

export const getTopSkills = (count: number = 6): Skill[] => {
  return [...skills]
    .sort((a, b) => getScoreFromLevel(b.level) - getScoreFromLevel(a.level) || featuredRank(a) - featuredRank(b))
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
