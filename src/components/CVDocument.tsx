'use client';

import { Document, Page, View, Text, Link, StyleSheet } from '@react-pdf/renderer';
import { CVStyle, SiteConfig, Experience, Education, Language, Certification, Hobby, Project, Skill } from '@/config';
import {
  getRelevantSkills,
  sortExperienceByDate,
  parseDescription,
  getProficiencyDisplay,
  stripUrl,
  getContactInfo,
  filterForCV,
  getPublicProjects,
  type ContactItem,
} from '@/lib/cv-helpers';
import type { ContributionStats } from '@/lib/github-contributions';

interface CVDocumentProps {
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
  useColumnLayout?: boolean;
  contributionStats?: Record<string, ContributionStats | null>;
}

const styles = StyleSheet.create({
  page: {
    padding: '0.4in',
    fontFamily: 'Times-Roman',
    fontSize: 11,
    lineHeight: 1.3,
    color: '#000000',
  },
  header: {
    marginBottom: 10,
    paddingBottom: 7,
    borderBottomWidth: 2.5,
    borderBottomColor: '#000000',
  },
  name: {
    fontFamily: 'Times-Bold',
    fontSize: 21,
    letterSpacing: 0.8,
    marginBottom: 7,
  },
  contactLine: {
    fontSize: 10.5,
    color: '#4a4a4a',
    letterSpacing: 0.1,
    lineHeight: 1.3,
  },
  section: {
    marginBottom: 9,
  },
  sectionHeader: {
    fontFamily: 'Times-Bold',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
  },
  entry: {
    marginBottom: 6,
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
    lineHeight: 1.32,
    marginBottom: 1.5,
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
  skillCategory: {
    marginBottom: 6,
  },
  skillCategoryLabel: {
    fontFamily: 'Times-Bold',
    fontSize: 12,
    marginBottom: 3,
    letterSpacing: 0.1,
  },
  skillCategoryList: {
    fontSize: 10.5,
    marginLeft: 12,
    lineHeight: 1.5,
    color: '#1a1a1a',
    letterSpacing: 0.05,
  },
  bodyText: {
    fontSize: 11,
    textAlign: 'justify',
    lineHeight: 1.4,
    color: '#1a1a1a',
  },
  inlineLabel: {
    fontFamily: 'Times-Bold',
    color: '#000000',
    letterSpacing: 0.1,
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
  <Text style={[styles.sectionHeader, { color: accentColor, borderBottomColor: accentColor }]}>{children}</Text>
);

const ContactLine = ({ items, marginTop = 0 }: { items: ContactItem[]; marginTop?: number }) => items.length > 0 && (
  <Text style={[styles.contactLine, { marginTop }]}>
    {items.map((item, idx) => (
      <Text key={item.text}>
        {item.href ? (
          <Link src={item.href} style={{ color: '#4a4a4a', textDecoration: 'none' }}>{item.text}</Link>
        ) : item.text}
        {idx < items.length - 1 ? ' | ' : ''}
      </Text>
    ))}
  </Text>
);

const SkillsBlock = ({ technicalSkills, softSkills, hasSoftSkills, accentColor }: {
  technicalSkills: Record<string, Skill[]>;
  softSkills: Record<string, Skill[]>;
  hasSoftSkills: boolean;
  accentColor: string;
}) => (
  <>
    <View style={styles.section} wrap={false}>
      <SectionHeader accentColor={accentColor}>Technical Skills</SectionHeader>
      {Object.entries(technicalSkills).map(([category, categorySkills]) => (
        <View key={category} style={styles.skillCategory}>
          <Text style={styles.skillCategoryLabel}>{category}:</Text>
          <Text style={styles.skillCategoryList}>{categorySkills.map(s => s.name).join(', ')}</Text>
        </View>
      ))}
    </View>
    {hasSoftSkills && (
      <View style={styles.section} wrap={false}>
        <SectionHeader accentColor={accentColor}>Soft Skills</SectionHeader>
        {Object.entries(softSkills).map(([category, categorySkills]) => (
          <View key={category} style={styles.skillCategory}>
            <Text style={styles.skillCategoryLabel}>{category}:</Text>
            <Text style={styles.skillCategoryList}>{categorySkills.map(s => s.name).join(', ')}</Text>
          </View>
        ))}
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
          {edu.startDate} {edu.endDate ? `- ${edu.endDate}` : '- Present'}{edu.grade && ` | ${edu.grade}`}
        </Text>
        {edu.thesisUrl && (
          <Text style={styles.entryMeta}>
            <Text style={styles.inlineLabel}>Thesis: </Text>
            <Link src={`https://${siteDomain}${edu.thesisUrl}`} style={{ color: '#3a3a3a', textDecoration: 'none' }}>View PDF</Link>
          </Text>
        )}
      </View>
    ))}
  </View>
);

const CertificationsBlock = ({ certifications, accentColor }: { certifications: Certification[]; accentColor: string }) => certifications.length > 0 && (
  <View style={styles.section}>
    <SectionHeader accentColor={accentColor}>Certifications</SectionHeader>
    {certifications.map((cert) => (
      <View key={cert.id} style={styles.entry} wrap={false}>
        <Text style={[styles.entryTitle, { fontSize: 12 }]}>{cert.name}</Text>
        <Text style={styles.entryMeta}>
          {cert.issuer} | {cert.issueDate}{cert.expiryDate && ` - ${cert.expiryDate}`}
        </Text>
      </View>
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
        <Text style={styles.entryTitle}>
          {project.name}
          {project.repository && (
            <Text style={{ fontFamily: 'Times-Roman', fontSize: 10, color: '#3a3a3a' }}>
              {'  ('}{project.projectType === 'contribution' ? 'Contribution' : 'Personal'}{')'}
            </Text>
          )}
        </Text>
        <Text style={[styles.entrySubtitle, { textAlign: 'justify' }]}>{project.description}</Text>
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
        {project.repository && (
          <Text style={styles.entryMeta}>
            <Text style={styles.inlineLabel}>Repository: </Text>
            <Link src={project.repository} style={{ color: '#3a3a3a', textDecoration: 'none' }}>{stripUrl(project.repository)}</Link>
          </Text>
        )}
      </View>
      );
    })}
  </View>
);

const AdditionalInfoBlock = ({ hobbies, accentColor, showHobbies }: { hobbies: Hobby[]; accentColor: string; showHobbies: boolean }) => showHobbies && hobbies.length > 0 && (
  <View style={styles.section} wrap={false}>
    <SectionHeader accentColor={accentColor}>Additional Information</SectionHeader>
    <Text style={styles.bodyText}>
      <Text style={styles.inlineLabel}>Interests: </Text>
      {hobbies.map(h => h.name).join(', ')}
    </Text>
  </View>
);

export default function CVDocument({
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
  useColumnLayout = false,
  contributionStats = {},
}: CVDocumentProps) {
  const accentColor = style.colorScheme?.primary || '#000000';
  const { technicalSkills, softSkills, hasSoftSkills } = getRelevantSkills(style);
  const publicProjects = getPublicProjects(projects, style);
  const sortedExperience = sortExperienceByDate(experience);
  const cvEducation = filterForCV(education);
  const cvLanguages = filterForCV(languages);
  const contactInfo = getContactInfo(siteConfig, email);

  const keywords = Array.from(new Set([
    style.domain,
    style.name,
    ...Object.values(technicalSkills).flat().map(s => s.name),
  ])).join(', ');

  return (
    <Document
      title={`CV — ${siteConfig.fullName}`}
      author={siteConfig.fullName}
      subject={`${style.name} - CV`}
      keywords={keywords}
      creator={siteConfig.fullName}
      producer={siteConfig.fullName}
    >
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: accentColor }]}>
          <Text style={[styles.name, { color: accentColor }]}>{siteConfig.fullName}</Text>
          <ContactLine items={contactInfo.personal} />
          <ContactLine items={contactInfo.links} marginTop={2} />
        </View>

        {/* Summary */}
        {(style.summary || summary) && (
          <View style={styles.section} wrap={false}>
            <SectionHeader accentColor={accentColor}>Summary</SectionHeader>
            <Text style={styles.bodyText}>{style.summary || summary}</Text>
          </View>
        )}

        {/* Professional Experience */}
        <View style={styles.section}>
          <SectionHeader accentColor={accentColor}>Professional Experience</SectionHeader>
          {sortedExperience.map((exp) => {
            const descriptionPoints = parseDescription(exp.description);
            return (
              <View key={exp.id} style={[styles.entry, { marginBottom: 7 }]} wrap={false}>
                <Text style={styles.entryTitle}>
                  {exp.role}, <Text style={{ color: accentColor }}>{exp.company}</Text>{exp.location && `, ${exp.location}`}
                </Text>
                <Text style={styles.entryDate}>
                  {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : '- Present'}
                </Text>
                {descriptionPoints.length > 0 && (
                  <View style={styles.bulletList}>
                    {descriptionPoints.map((point, idx) => (
                      <Text key={idx} style={styles.bulletItem}>{'• '}{point}</Text>
                    ))}
                  </View>
                )}
                {exp.skills && exp.skills.length > 0 && (
                  <Text style={styles.techLine}>
                    <Text style={styles.techLineLabel}>Technologies: </Text>
                    {exp.skills.join(', ')}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Remaining sections */}
        {useColumnLayout ? (
          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <EducationBlock education={cvEducation} accentColor={accentColor} siteDomain={siteConfig.domain} />
              <CertificationsBlock certifications={certifications} accentColor={accentColor} />
            </View>
            <View style={styles.column}>
              <SkillsBlock technicalSkills={technicalSkills} softSkills={softSkills} hasSoftSkills={hasSoftSkills} accentColor={accentColor} />
              <LanguagesBlock languages={cvLanguages} accentColor={accentColor} />
              <ProjectsBlock projects={publicProjects} accentColor={accentColor} contributionStats={contributionStats} />
              <AdditionalInfoBlock hobbies={hobbies} accentColor={accentColor} showHobbies={style.showHobbies !== false} />
            </View>
          </View>
        ) : (
          <>
            <SkillsBlock technicalSkills={technicalSkills} softSkills={softSkills} hasSoftSkills={hasSoftSkills} accentColor={accentColor} />
            <EducationBlock education={cvEducation} accentColor={accentColor} siteDomain={siteConfig.domain} />
            <CertificationsBlock certifications={certifications} accentColor={accentColor} />
            <LanguagesBlock languages={cvLanguages} accentColor={accentColor} />
            <ProjectsBlock projects={publicProjects} accentColor={accentColor} contributionStats={contributionStats} />
            <AdditionalInfoBlock hobbies={hobbies} accentColor={accentColor} showHobbies={style.showHobbies !== false} />
          </>
        )}
      </Page>
    </Document>
  );
}
