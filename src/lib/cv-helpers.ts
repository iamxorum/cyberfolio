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

    if (category.toLowerCase() === 'soft') {
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

const SHORT_MONTHS: Record<string, string> = {
  January: 'Jan', February: 'Feb', March: 'Mar', April: 'Apr', June: 'Jun', July: 'Jul',
  August: 'Aug', September: 'Sep', October: 'Oct', November: 'Nov', December: 'Dec',
};

/** "October 2024" becomes "Oct 2024", so every date on the CV is written the same way. */
const shortDate = (date: string) => date.replace(/\b[A-Z][a-z]{2,8}\b/g, (month) => SHORT_MONTHS[month] ?? month);

/** No end date, "ongoing" or "Present" all mean the period is still running. */
export const isOngoingEnd = (endDate?: string): boolean => !endDate || /^(ongoing|present)$/i.test(endDate.trim());

/** A period that may still be running: no end date reads as "Present". */
export const formatDateRange = (startDate: string, endDate?: string): string => {
  const isOngoing = isOngoingEnd(endDate);
  return `${shortDate(startDate)} – ${isOngoing ? 'Present' : shortDate(endDate ?? '')}`;
};

/** A fixed span, or a single date when there is no end (e.g. a certificate that never expires). */
export const formatDateSpan = (startDate: string, endDate?: string): string =>
  endDate ? `${shortDate(startDate)} – ${shortDate(endDate ?? '')}` : shortDate(startDate);

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

export interface ContactItem {
  text: string;
  href?: string;
}

export interface ContactGroups {
  personal: ContactItem[];
  links: ContactItem[];
}

export const getContactInfo = (siteConfig: SiteConfig, email?: string, phone?: string): ContactGroups => {
  const linkedinLink = siteConfig.social.professional?.find(s => s.name.toLowerCase().includes('linkedin'));
  const githubLink = siteConfig.social.professional?.find(s => s.name.toLowerCase().includes('github'));
  const website = siteConfig.domain ? `https://${siteConfig.domain}` : '';

  const personal: ContactItem[] = [];
  if (email) personal.push({ text: email, href: `mailto:${email}` });
  if (phone) personal.push({ text: phone, href: `tel:${phone.replace(/[^+\d]/g, '')}` });
  if (siteConfig.location) personal.push({ text: siteConfig.location });

  const links: ContactItem[] = [];
  if (linkedinLink) links.push({ text: stripUrl(linkedinLink.url), href: linkedinLink.url });
  if (githubLink) links.push({ text: stripUrl(githubLink.url), href: githubLink.url });
  if (website) links.push({ text: stripUrl(website), href: website });

  return { personal, links };
};

export const filterForCV = <T extends { includeInCV?: boolean }>(items: T[]): T[] =>
  items.filter(item => item.includeInCV !== false);

export const getPublicProjects = (projects: Project[] | undefined, style: CVStyle): Project[] => {
  const showProjects = style.showProjects !== false;
  return showProjects && projects ? filterForCV(projects.filter(p => p.visibility === 'public')) : [];
};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

const parseMonthYear = (value: string): { year: number; month: number } | null => {
  const year = value.match(/\b(\d{4})\b/);
  if (!year) return null;
  const monthIdx = MONTHS.findIndex(m => value.toLowerCase().includes(m));
  return { year: Number(year[1]), month: monthIdx === -1 ? 0 : monthIdx };
};

const toMonthIndex = (startDate: string, endDate?: string): [number, number] | null => {
  const start = parseMonthYear(startDate);
  if (!start) return null;
  const isOngoing = isOngoingEnd(endDate);
  const now = new Date();
  const end = isOngoing ? { year: now.getFullYear(), month: now.getMonth() } : parseMonthYear(endDate ?? '');
  if (!end) return null;
  const from = start.year * 12 + start.month;
  const to = end.year * 12 + end.month;
  return to >= from ? [from, to] : null;
};

const formatMonths = (total: number): string => {
  const years = Math.floor(total / 12);
  const months = total % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'yr' : 'yrs'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mo' : 'mos'}`);
  return parts.join(' ');
};

/** "2 yrs 4 mos" from config-style dates ("Jan 2023", "2023"); end counts inclusively. Empty if unparseable. */
export const formatDuration = (startDate: string, endDate?: string): string => {
  const range = toMonthIndex(startDate, endDate);
  return range ? formatMonths(range[1] - range[0] + 1) : '';
};

/** Combined length of all roles; overlapping months are counted once. Empty if nothing parses. */
export const formatTotalDuration = (roles: { startDate: string; endDate?: string }[]): string => {
  const ranges = roles
    .map(r => toMonthIndex(r.startDate, r.endDate))
    .filter((r): r is [number, number] => r !== null)
    .sort((a, b) => a[0] - b[0]);

  let total = 0;
  let curEnd = -Infinity;
  for (const [from, to] of ranges) {
    const begin = Math.max(from, curEnd + 1);
    if (to >= begin) total += to - begin + 1;
    curEnd = Math.max(curEnd, to);
  }
  return total > 0 ? formatMonths(total) : '';
};
