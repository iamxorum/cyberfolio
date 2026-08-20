import { CVStyle, SiteConfig, Experience, Language, Project, Skill, getSkillsGroupedByCategory } from '@/config';

export const getRelevantSkills = (style: CVStyle) => {
  const skillsByCategory = getSkillsGroupedByCategory();
  const relevantCategories = style.skillCategories || Object.keys(skillsByCategory);
  const excludedSkills = new Set(style.excludeSkills || []);

  const technicalSkills: Record<string, Skill[]> = {};
  const softSkills: Record<string, Skill[]> = {};

  relevantCategories.forEach(category => {
    if (!skillsByCategory[category]) return;
    const categorySkills = skillsByCategory[category].filter(skill => !excludedSkills.has(skill.name));
    if (categorySkills.length === 0) return;

    if (category.toLowerCase() === 'soft skills') {
      softSkills[category] = categorySkills;
    } else {
      technicalSkills[category] = categorySkills;
    }
  });

  return { technicalSkills, softSkills, hasSoftSkills: Object.keys(softSkills).length > 0 };
};

const parseDate = (dateStr: string): Date => {
  if (!dateStr || dateStr.toLowerCase() === 'ongoing' || dateStr.toLowerCase() === 'present') {
    return new Date(9999, 11, 31);
  }

  const monthNames: Record<string, number> = {
    'jan': 0, 'january': 0, 'feb': 1, 'february': 1, 'mar': 2, 'march': 2,
    'apr': 3, 'april': 3, 'may': 4, 'jun': 5, 'june': 5,
    'jul': 6, 'july': 6, 'aug': 7, 'august': 7, 'sep': 8, 'sept': 8, 'september': 8,
    'oct': 9, 'october': 9, 'nov': 10, 'november': 10, 'dec': 11, 'december': 11
  };

  const parts = dateStr.trim().toLowerCase().split(/\s+/);
  if (parts.length >= 2) {
    const month = monthNames[parts[0]];
    const year = parseInt(parts[1]);
    if (month !== undefined && !isNaN(year)) {
      return new Date(year, month, 1);
    }
  }

  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? new Date(0) : parsed;
};

export const sortExperienceByDate = (experience: Experience[]): Experience[] => {
  return [...experience].sort((a, b) => {
    const dateA = parseDate(a.endDate || a.startDate);
    const dateB = parseDate(b.endDate || b.startDate);

    if (dateA.getTime() === dateB.getTime() && dateA.getFullYear() === 9999) {
      return parseDate(b.startDate).getTime() - parseDate(a.startDate).getTime();
    }

    return dateB.getTime() - dateA.getTime();
  });
};

export const parseDescription = (description: string | undefined): string[] => {
  if (!description) return [];

  if (description.includes('•')) {
    return description.split('•').filter(item => item.trim().length > 0).map(item => item.trim());
  }
  
  if (description.includes(' - ')) {
    return description.split(/\s-\s/).filter(item => item.trim().length > 0).map(item => item.trim());
  }
  if (description.includes(';')) {
    return description.split(';').filter(item => item.trim().length > 0).map(item => item.trim());
  }
  return [description];
};

export const getProficiencyDisplay = (lang: Language): string => {
  if (lang.proficiency && lang.spoken) return `${lang.proficiency} (${lang.spoken})`;
  if (lang.proficiency) return lang.proficiency;
  return `${lang.spoken || ''}${lang.written ? ` / ${lang.written}` : ''}`;
};

export const stripUrl = (url: string): string =>
  url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');

export const getContactInfo = (siteConfig: SiteConfig, email?: string): string[] => {
  const linkedinLink = siteConfig.social.professional?.find(s => s.name.toLowerCase().includes('linkedin'));
  const githubLink = siteConfig.social.professional?.find(s => s.name.toLowerCase().includes('github'));
  const website = siteConfig.domain ? `https://${siteConfig.domain}` : '';

  const contactInfo: string[] = [];
  if (email) contactInfo.push(email);
  if (siteConfig.location) contactInfo.push(siteConfig.location);
  if (linkedinLink) contactInfo.push(stripUrl(linkedinLink.url));
  if (githubLink) contactInfo.push(stripUrl(githubLink.url));
  if (website) contactInfo.push(stripUrl(website));
  return contactInfo;
};

export const filterForCV = <T extends { includeInCV?: boolean }>(items: T[]): T[] =>
  items.filter(item => item.includeInCV !== false);

export const getPublicProjects = (projects: Project[] | undefined, style: CVStyle): Project[] => {
  const showProjects = style.showProjects !== false;
  return showProjects && projects ? projects.filter(p => p.visibility === 'public') : [];
};
