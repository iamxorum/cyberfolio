'use client';

import { useState } from 'react';
import SkillsRadar from '@/components/SkillsRadar';
import { getCategories, getSkillsByCategory, getSkillsGroupedByCategory, getScoreFromLevel, getTopSkills } from '@/config';

function getRadarSkills(selectedCategory: string | null) {
  if (selectedCategory) {
    const categorySkills = getSkillsByCategory(selectedCategory);
    return categorySkills.length > 6
      ? categorySkills.sort((a, b) => getScoreFromLevel(b.level) - getScoreFromLevel(a.level)).slice(0, 6)
      : categorySkills;
  }
  return getTopSkills(6);
}

export default function SkillsPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getCategories();
  const skillsByCategory = getSkillsGroupedByCategory();
  const radarSkills = getRadarSkills(selectedCategory);
  const listedSkills = (selectedCategory ? getSkillsByCategory(selectedCategory) : Object.values(skillsByCategory).flat())
    .sort((a, b) => getScoreFromLevel(b.level) - getScoreFromLevel(a.level));

  return (
    <div id="skills" className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-3 sm:p-4 font-mono text-xs scroll-mt-20">
      <div className="flex justify-between items-center mb-2 sm:mb-3 border-b border-[var(--terminal-border)] pb-2">
        <span className="text-[var(--terminal-text-dim)] text-[10px] sm:text-xs">SKILLS_MATRIX</span>
        <span className="text-primary font-bold text-[10px] sm:text-xs">{selectedCategory ? selectedCategory.toUpperCase() : 'ALL'}</span>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-mono transition-all active:scale-90 ${selectedCategory === null
            ? 'bg-primary text-[var(--terminal-on-primary)] border border-primary'
            : 'bg-[var(--terminal-bg)] text-[var(--terminal-text-muted)] border border-[var(--terminal-border)] hover:border-primary hover:text-primary'
            }`}
        >
          ALL
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-mono transition-all active:scale-90 ${selectedCategory === category
              ? 'bg-primary text-[var(--terminal-on-primary)] border border-primary'
              : 'bg-[var(--terminal-bg)] text-[var(--terminal-text-muted)] border border-[var(--terminal-border)] hover:border-primary hover:text-primary'
              }`}
          >
            {category.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Radar Chart */}
      <SkillsRadar skills={radarSkills} />

      {/* Skills List */}
      <div tabIndex={0} role="region" aria-label="Skills list" className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto pr-2 sm:pr-3">
        {listedSkills.map((skill, index) => {
          const score = getScoreFromLevel(skill.level);
          return (
            <div key={skill.name} className="animate-reveal flex items-center justify-between text-[9px] sm:text-[10px]" style={{ animationDelay: `${Math.min(index, 10) * 60}ms` }}>
              <div className="flex items-center min-w-0 flex-1">
                <span className="text-[var(--terminal-text-muted)] truncate">
                  {skill.name}
                  <span className="text-[var(--terminal-text-dim)] hidden sm:inline"> ({skill.category})</span>
                </span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <div className="w-16 sm:w-20 h-1 sm:h-1.5 bg-[var(--terminal-bg)] border border-[var(--terminal-border)] rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-blue-500"
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                <span className="text-primary font-bold w-7 sm:w-8 text-right text-[9px] sm:text-[10px]">{score}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
