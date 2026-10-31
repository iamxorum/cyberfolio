'use client';

import { usePrintAccent } from '@/hooks/usePrintAccent';
import { CVStyle, SiteConfig, Experience, Education, Language, Certification, Hobby, Project } from '@/config';
import {
  getRelevantSkills,
  sortExperienceByDate,
  getContactInfo,
  filterForCV,
  getPublicProjects,
  getCVCertifications,
} from '@/lib/cv-helpers';
import { NO_CONTRIBUTION_STATS, type ContributionStats } from '@/lib/github-contributions';
import CVTemplateHeader from '@/components/cv-template/CVTemplateHeader';
import CVSummarySection from '@/components/cv-template/CVSummarySection';
import CVExperienceSection from '@/components/cv-template/CVExperienceSection';
import CVEducationSection from '@/components/cv-template/CVEducationSection';
import CVCertificationsSection from '@/components/cv-template/CVCertificationsSection';
import CVSkillsSection from '@/components/cv-template/CVSkillsSection';
import CVLanguagesSection from '@/components/cv-template/CVLanguagesSection';
import CVProjectsSection from '@/components/cv-template/CVProjectsSection';
import CVAdditionalInfoSection from '@/components/cv-template/CVAdditionalInfoSection';

export interface CVTemplateProps {
  style: CVStyle;
  siteConfig: SiteConfig;
  experience: Experience[];
  education: Education[];
  languages: Language[];
  certifications: Certification[];
  hobbies: Hobby[];
  projects?: Project[];
  summary?: string;
  useColumnLayout?: boolean;
  contributionStats?: Record<string, ContributionStats | null>;
}

export default function CVTemplate({
  style,
  siteConfig,
  experience,
  education,
  languages,
  certifications,
  hobbies,
  projects = [],
  summary,
  useColumnLayout = true,
  contributionStats = NO_CONTRIBUTION_STATS,
}: CVTemplateProps) {
  const accentColor = usePrintAccent();
  const { technicalSkills, softSkills, hasSoftSkills } = getRelevantSkills(style);
  const publicProjects = getPublicProjects(projects, style);

  const sortedExperience = sortExperienceByDate(experience);
  const cvCertifications = getCVCertifications(certifications);
  const cvEducation = filterForCV(education);
  const cvLanguages = filterForCV(languages);
  const contactInfo = getContactInfo(siteConfig);
  const showHobbies = style.showHobbies !== false && hobbies.length > 0;
  const sectionMarginBottom = useColumnLayout ? '10pt' : '9pt';

  const skillsSections = (marginBottom: string) => (
    <>
      <CVSkillsSection title="TECHNICAL SKILLS" skills={technicalSkills} accentColor={accentColor} sectionMarginBottom={marginBottom} />
      {hasSoftSkills && <CVSkillsSection title="SOFT SKILLS" skills={softSkills} accentColor={accentColor} sectionMarginBottom={marginBottom} />}
    </>
  );

  const educationAndCerts = (
    <>
      <CVEducationSection education={cvEducation} siteConfig={siteConfig} accentColor={accentColor} sectionMarginBottom={sectionMarginBottom} />
      {cvCertifications.length > 0 && (
        <CVCertificationsSection certifications={cvCertifications} accentColor={accentColor} sectionMarginBottom={sectionMarginBottom} />
      )}
    </>
  );

  const languagesProjectsAndInfo = (
    <>
      {cvLanguages.length > 0 && (
        <CVLanguagesSection languages={cvLanguages} accentColor={accentColor} sectionMarginBottom={sectionMarginBottom} />
      )}
      {publicProjects.length > 0 && (
        <CVProjectsSection projects={publicProjects} contributionStats={contributionStats} accentColor={accentColor} sectionMarginBottom={sectionMarginBottom} />
      )}
      {showHobbies && (
        <CVAdditionalInfoSection hobbies={hobbies} accentColor={accentColor} sectionMarginBottom={sectionMarginBottom} />
      )}
    </>
  );

  return (
    <div className="cv-template ats-friendly bg-white text-black" style={{ fontFamily: 'Times New Roman, serif', fontSize: '11pt', lineHeight: '1.4' }}>
      <CVTemplateHeader siteConfig={siteConfig} role={style.name} accentColor={accentColor} contactInfo={contactInfo} />

      {(style.summary || summary) && (
        <CVSummarySection text={(style.summary || summary)!} accentColor={accentColor} />
      )}

      <CVExperienceSection experience={sortedExperience} accentColor={accentColor} />

      {useColumnLayout ? (
        <div style={{ display: 'flex', gap: '16pt', marginBottom: '8pt' }}>
          <div style={{ flex: '1' }}>
            {educationAndCerts}
          </div>
          <div style={{ flex: '1' }}>
            {skillsSections('8pt')}
            {languagesProjectsAndInfo}
          </div>
        </div>
      ) : (
        <>
          {skillsSections('10pt')}
          {educationAndCerts}
          {languagesProjectsAndInfo}
        </>
      )}
    </div>
  );
}
