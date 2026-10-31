'use client';

import { getPrintAccent } from '@/lib/accent';
import { Document, Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import '@/components/pdf/no-hyphenation';
import { CVStyle, SiteConfig, Experience, Education, Language, Certification, Hobby, Project, Skill } from '@/config';
import {
  getRelevantSkills,
  sortExperienceByDate,
  getProficiencyDisplay,
  stripUrl,
  getContactInfo,
  filterForCV,
  getPublicProjects,
  formatDateRange,
  formatDateSpan,
  getCVStack,
  getCVCertifications,
  splitFamiliarSkills,
} from '@/lib/cv-helpers';
import { splitInterests } from '@/lib/cv-designed';
import type { ContributionStats } from '@/lib/github-contributions';
import { cvMetadata } from '@/lib/pdf-metadata';
import DocumentHeader from '@/components/pdf/DocumentHeader';

export interface CVDocumentProps {
  style: CVStyle;
  siteConfig: SiteConfig;
  experience: Experience[];
  education: Education[];
  languages: Language[];
  certifications: Certification[];
  hobbies: Hobby[];
  projects?: Project[];
  summary?: string;
  email?: string;
  phone?: string;
  useColumnLayout?: boolean;
  contributionStats?: Record<string, ContributionStats | null>;
  /** Header photo (data URL). Designed CV only. */
  photo?: string;
}

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: '0.4in',
    paddingVertical: '0.32in',
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.25,
    color: '#000000',
  },
  section: {
    marginBottom: 6,
  },
  sectionHeader: {
    fontFamily: 'Times-Bold',
    fontSize: 12.5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
    paddingBottom: 2,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  entry: {
    marginBottom: 4,
  },
  certLine: {
    fontSize: 11,
    lineHeight: 1.35,
    marginBottom: 2,
    color: '#1a1a1a',
    letterSpacing: 0.05,
  },
  certName: {
    fontFamily: 'Times-Bold',
    color: '#000000',
  },
  certMeta: {
    fontSize: 10,
    fontFamily: 'Times-Italic',
    color: '#3a3a3a',
  },
  entryTitle: {
    fontFamily: 'Times-Bold',
    fontSize: 12,
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  entryDate: {
    fontSize: 10.5,
    color: '#2a2a2a',
    fontFamily: 'Times-Italic',
    letterSpacing: 0.1,
    marginBottom: 3,
  },
  roleIntro: {
    fontSize: 11,
    lineHeight: 1.3,
    color: '#1a1a1a',
    marginTop: 1,
  },
  entrySubtitle: {
    fontSize: 10.5,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  entryMeta: {
    fontSize: 10,
    fontFamily: 'Times-Italic',
    color: '#3a3a3a',
    letterSpacing: 0.05,
  },
  bulletList: {
    marginLeft: 12,
    marginTop: 3,
  },
  bulletItem: {
    fontSize: 11,
    lineHeight: 1.26,
    marginBottom: 1.2,
    color: '#1a1a1a',
  },
  techLine: {
    marginTop: 3,
    fontSize: 10.5,
    fontFamily: 'Times-Italic',
    marginLeft: 12,
    color: '#3a3a3a',
  },
  techLineLabel: {
    fontFamily: 'Times-Bold',
    color: '#000000',
  },
  skillCategoryLine: {
    fontSize: 10.5,
    lineHeight: 1.4,
    marginBottom: 2,
    color: '#1a1a1a',
    letterSpacing: 0.05,
  },
  skillCategoryLabel: {
    fontFamily: 'Times-Bold',
    color: '#000000',
  },
  bodyText: {
    fontSize: 11,
    textAlign: 'left',
    lineHeight: 1.4,
    color: '#1a1a1a',
  },
  inlineLabel: {
    fontFamily: 'Times-Bold',
    color: '#000000',
    letterSpacing: 0.1,
  },
  projectTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2,
  },
  projectLink: {
    fontSize: 10,
    fontFamily: 'Times-Italic',
    color: '#3a3a3a',
    textDecoration: 'none',
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
  },
});

const SectionHeader = ({ children, accentColor }: { children: string; accentColor: string }) => (
  <Text minPresenceAhead={50} style={[styles.sectionHeader, { color: accentColor, borderBottomColor: accentColor }]}>{children}</Text>
);

const RoleDetails = ({ exp }: { exp: Experience }) => {
  const { intro, bullets: points = [] } = exp;
  const stack = getCVStack(exp);
  return (
    <>
      {intro && <Text style={styles.roleIntro}>{intro}</Text>}
      {points.length > 0 && (
        <View style={styles.bulletList}>
          {points.map((point) => (
            <Text key={point} style={styles.bulletItem}>{'• '}{point}</Text>
          ))}
        </View>
      )}
      {stack.length > 0 && (
        <Text style={styles.techLine}>
          <Text style={styles.techLineLabel}>Technologies: </Text>
          {stack.join(', ')}
        </Text>
      )}
    </>
  );
};

const SkillsList = ({ skills }: { skills: Record<string, Skill[]> }) => (
  <>
    {Object.entries(skills).map(([category, categorySkills]) => (
      <Text key={category} style={styles.skillCategoryLine}>
        <Text style={styles.skillCategoryLabel}>{category}: </Text>
        {categorySkills.map(s => s.name).join(', ')}
      </Text>
    ))}
  </>
);

const SkillsBlock = ({ technicalSkills, familiarSkills, softSkills, hasSoftSkills, accentColor }: {
  technicalSkills: Record<string, Skill[]>;
  familiarSkills: Skill[];
  softSkills: Record<string, Skill[]>;
  hasSoftSkills: boolean;
  accentColor: string;
}) => (
  <>
    <View style={styles.section} wrap={false}>
      <SectionHeader accentColor={accentColor}>Technical Skills</SectionHeader>
      <SkillsList skills={technicalSkills} />
      {familiarSkills.length > 0 && (
        <Text style={styles.skillCategoryLine}>
          <Text style={styles.skillCategoryLabel}>Familiar with: </Text>
          {familiarSkills.map(s => s.name).join(', ')}
        </Text>
      )}
    </View>
    {hasSoftSkills && (
      <View style={styles.section} wrap={false}>
        <SectionHeader accentColor={accentColor}>Soft Skills</SectionHeader>
        <SkillsList skills={softSkills} />
      </View>
    )}
  </>
);

const EducationBlock = ({ education, accentColor, siteDomain }: { education: Education[]; accentColor: string; siteDomain: string }) => (
  <View style={styles.section}>
    <SectionHeader accentColor={accentColor}>Education</SectionHeader>
    {education.map((edu) => (
      <View key={edu.id} style={styles.entry} wrap={false}>
        <Text style={styles.entryTitle}>{edu.degree}{edu.field && `, ${edu.field}`}</Text>
        <Text style={styles.entrySubtitle}>{edu.institution}{edu.location && `, ${edu.location}`}</Text>
        <Text style={styles.entryMeta}>
          {formatDateRange(edu.startDate, edu.endDate)}{edu.grade && ` | ${edu.grade}`}
          {edu.thesisUrl && (
            <>
              {' | '}
              <Link src={`https://${siteDomain}${edu.thesisUrl}`} style={{ color: '#3a3a3a' }}>Thesis (PDF)</Link>
            </>
          )}
        </Text>
      </View>
    ))}
  </View>
);

const CertificationsBlock = ({ certifications, accentColor }: { certifications: Certification[]; accentColor: string }) => certifications.length > 0 && (
  <View style={styles.section} wrap={false}>
    <SectionHeader accentColor={accentColor}>Certifications</SectionHeader>
    {certifications.map((cert) => (
      <Text key={cert.id} style={styles.certLine}>
        <Text style={styles.certName}>{cert.name}</Text>
        {' - '}
        <Text style={{ color: accentColor }}>{cert.issuer}</Text>
        {' | '}
        <Text style={styles.certMeta}>
          {formatDateSpan(cert.issueDate, cert.expiryDate)}
        </Text>
      </Text>
    ))}
  </View>
);

const LanguagesBlock = ({ languages, accentColor }: { languages: Language[]; accentColor: string }) => languages.length > 0 && (
  <View style={styles.section} wrap={false}>
    <SectionHeader accentColor={accentColor}>Languages</SectionHeader>
    <Text style={styles.bodyText}>
      {languages.map((lang, idx) => (
        <Text key={lang.id}>
          <Text style={styles.inlineLabel}>{lang.name}: </Text>
          {getProficiencyDisplay(lang)}
          {idx < languages.length - 1 ? '  |  ' : ''}
        </Text>
      ))}
    </Text>
  </View>
);

const ProjectsBlock = ({ projects, accentColor, contributionStats = {} }: { projects: Project[]; accentColor: string; contributionStats?: Record<string, ContributionStats | null> }) => projects.length > 0 && (
  <View style={styles.section}>
    <SectionHeader accentColor={accentColor}>Projects</SectionHeader>
    {projects.map((project) => {
      const stats = contributionStats[project.id];
      return (
      <View key={project.id} style={styles.entry} wrap={false}>
        <View style={styles.projectTitleRow}>
          <Text style={styles.entryTitle}>
            {project.name}
            {project.repository && (
              <Text style={{ fontFamily: 'Times-Roman', fontSize: 10, color: '#3a3a3a' }}>
                {'  ('}{project.projectType === 'contribution' ? 'Contribution' : 'Personal'}{')'}
              </Text>
            )}
          </Text>
          {project.repository && (
            <Link src={project.repository} style={styles.projectLink}>{stripUrl(project.repository)}</Link>
          )}
        </View>
        <Text style={styles.entrySubtitle}>{project.cvDescription || project.description}</Text>
        {stats && stats.mergedCount > 0 && (
          <Text style={styles.entryMeta}>
            <Text style={styles.inlineLabel}>Contributions: </Text>
            <Link src={stats.searchUrl} style={{ color: '#3a3a3a', textDecoration: 'none' }}>
              {stats.mergedCount} merged PR{stats.mergedCount !== 1 ? 's' : ''}
            </Link>
            {stats.reviewCount > 0 && (
              <>
                {', '}
                <Link src={stats.reviewSearchUrl} style={{ color: '#3a3a3a', textDecoration: 'none' }}>
                  {stats.reviewCount} code review{stats.reviewCount !== 1 ? 's' : ''}
                </Link>
              </>
            )}
          </Text>
        )}
      </View>
      );
    })}
  </View>
);

const AdditionalInfoBlock = ({ hobbies, accentColor, showHobbies }: { hobbies: Hobby[]; accentColor: string; showHobbies: boolean }) => {
  const { studying, outside } = splitInterests(hobbies);
  return showHobbies && hobbies.length > 0 && (
    <View style={styles.section} wrap={false}>
      <SectionHeader accentColor={accentColor}>Interests</SectionHeader>
      {studying.length > 0 && (
        <Text style={styles.bodyText}>
          <Text style={styles.inlineLabel}>Studying: </Text>
          {studying.map(h => h.name).join(', ')}
        </Text>
      )}
      {outside.length > 0 && (
        <Text style={[styles.bodyText, { marginTop: 2 }]}>
          <Text style={styles.inlineLabel}>Outside work: </Text>
          {outside.map(h => h.name).join(', ')}
        </Text>
      )}
    </View>
  );
};

export function CVPage({
  style,
  siteConfig,
  experience,
  education,
  languages,
  certifications,
  hobbies,
  projects = [],
  summary,
  email,
  phone,
  useColumnLayout = false,
  contributionStats = {},
}: CVDocumentProps) {
  const accentColor = getPrintAccent();
  const { technicalSkills: allTechnicalSkills, softSkills, hasSoftSkills } = getRelevantSkills(style);
  const { main: technicalSkills, familiar: familiarSkills } = splitFamiliarSkills(allTechnicalSkills);
  const publicProjects = getPublicProjects(projects, style);
  const sortedExperience = sortExperienceByDate(experience);
  const cvCertifications = getCVCertifications(certifications);
  const cvEducation = filterForCV(education);
  const cvLanguages = filterForCV(languages);
  const contactInfo = getContactInfo(siteConfig, email, phone);

  return (
    <Page size="A4" style={styles.page} wrap>
      <DocumentHeader name={siteConfig.fullName} role={style.name} accentColor={accentColor} contactInfo={contactInfo} />

      {(style.summary || summary) && (
        <View style={styles.section} wrap={false}>
          <SectionHeader accentColor={accentColor}>Summary</SectionHeader>
          <Text style={styles.bodyText}>{style.summary || summary}</Text>
        </View>
      )}

      <>
        <SectionHeader accentColor={accentColor}>Experience</SectionHeader>
        {sortedExperience.map((exp) => (
          <View key={exp.id} style={[styles.entry, { marginBottom: 5 }]} wrap={false}>
            <Text style={styles.entryTitle}>
              {exp.role}, <Text style={{ color: accentColor }}>{exp.company}</Text>{exp.location && `, ${exp.location}`}
            </Text>
            <Text style={styles.entryDate}>{formatDateRange(exp.startDate, exp.endDate)}</Text>
            <RoleDetails exp={exp} />
          </View>
        ))}
      </>

      {useColumnLayout ? (
        <View style={styles.twoColumnRow}>
          <View style={styles.column}>
            <EducationBlock education={cvEducation} accentColor={accentColor} siteDomain={siteConfig.domain} />
            <CertificationsBlock certifications={cvCertifications} accentColor={accentColor} />
          </View>
          <View style={styles.column}>
            <SkillsBlock technicalSkills={technicalSkills} familiarSkills={familiarSkills} softSkills={softSkills} hasSoftSkills={hasSoftSkills} accentColor={accentColor} />
            <LanguagesBlock languages={cvLanguages} accentColor={accentColor} />
            <ProjectsBlock projects={publicProjects} accentColor={accentColor} contributionStats={contributionStats} />
            <AdditionalInfoBlock hobbies={hobbies} accentColor={accentColor} showHobbies={style.showHobbies !== false} />
          </View>
        </View>
      ) : (
        <>
          <SkillsBlock technicalSkills={technicalSkills} familiarSkills={familiarSkills} softSkills={softSkills} hasSoftSkills={hasSoftSkills} accentColor={accentColor} />
          <EducationBlock education={cvEducation} accentColor={accentColor} siteDomain={siteConfig.domain} />
          <CertificationsBlock certifications={cvCertifications} accentColor={accentColor} />
          <LanguagesBlock languages={cvLanguages} accentColor={accentColor} />
          <ProjectsBlock projects={publicProjects} accentColor={accentColor} contributionStats={contributionStats} />
          <AdditionalInfoBlock hobbies={hobbies} accentColor={accentColor} showHobbies={style.showHobbies !== false} />
        </>
      )}
    </Page>
  );
}

export default function CVDocument(props: CVDocumentProps) {
  return (
    <Document {...cvMetadata(props.style, props.siteConfig)}>
      <CVPage {...props} />
    </Document>
  );
}
