export interface Skill {
  name: string;
  score: number; 
  category: string;
}

export const skills: Skill[] = [
  { name: 'JavaScript', score: 80, category: 'Frontend' },
  { name: 'React', score: 75, category: 'Frontend' },
  { name: 'Node.js', score: 70, category: 'Backend' },
  { name: 'TypeScript', score: 75, category: 'Backend' },
  { name: 'Python', score: 70, category: 'Backend' },
  { name: 'Docker', score: 65, category: 'DevOps' },
];


export const getTopSkills = (count: number = 6): Skill[] => {
  return [...skills]
    .sort((a, b) => b.score - a.score)
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
