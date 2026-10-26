'use client';

import type { ReactNode } from 'react';
import { getPrintAccent, tint } from '@/lib/accent';
import { Document, Page, View, Text, Link, Image, Svg, Circle, StyleSheet } from '@react-pdf/renderer';
import type { Skill } from '@/config';
import {
  getRelevantSkills,
  sortExperienceByDate,
  parseDescription,
  getProficiencyDisplay,
  stripUrl,
  getContactInfo,
  filterForCV,
  getPublicProjects,
  formatDateRange,
  formatDateSpan,
} from '@/lib/cv-helpers';
import { INK, PAPER, getCVHighlights, isStrongSkill } from '@/lib/cv-designed';
import { cvMetadata } from '@/lib/pdf-metadata';
import type { CVDocumentProps } from '@/components/CVDocument';

const ASIDE_WIDTH = '34%';
const PAGE_MARGIN = '0.4in';
const PHOTO_SIZE = 74;

// Dots for the header: fade in to the right, so the name stays clean.
const A4_WIDTH = 595;
const DOT_GAP = 13;
const DOT_ROWS = 22;
const HEADER_DOTS = Array.from({ length: DOT_ROWS }, (_, row) =>
  Array.from({ length: Math.ceil(A4_WIDTH / DOT_GAP) + 1 }, (_, col) => {
    const x = col * DOT_GAP + (row % 2 ? DOT_GAP / 2 : 0);
    return { key: `${row}-${col}`, x, y: row * DOT_GAP + 6, opacity: 0.03 + 0.22 * (x / A4_WIDTH) ** 1.5 };
  }),
).flat();

const styles = StyleSheet.create({
  page: {
    paddingVertical: PAGE_MARGIN,
    fontFamily: 'Helvetica',
    fontSize: 9.3,
    lineHeight: 1.38,
    color: '#1f2933',
    backgroundColor: PAPER,
  },
  // Fixed, so the panel colour runs the full height on every page.
  asideBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: ASIDE_WIDTH,
  },
  // Pulled over the page margin: full-bleed band.
  header: {
    marginTop: `-${PAGE_MARGIN}`,
    marginBottom: 16,
    paddingHorizontal: 30,
    paddingTop: 26,
    paddingBottom: 12,
    backgroundColor: INK,
    borderBottomWidth: 4,
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  photo: {
    position: 'absolute',
    top: 24,
    right: 30,
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: PHOTO_SIZE / 2,
    borderWidth: 2.5,
    objectFit: 'cover',
  },
  nameRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  name: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 32,
    lineHeight: 1.1,
    color: '#ffffff',
    marginRight: 9,
  },
  role: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  contact: {
    fontSize: 8.5,
    color: '#e2e8f0',
    marginRight: 14,
    marginBottom: 2,
    textDecoration: 'none',
  },
  highlights: {
    flexDirection: 'row',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: '#334155',
  },
  highlight: {
    marginRight: 30,
  },
  highlightValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    lineHeight: 1.1,
    color: '#ffffff',
    marginBottom: 3,
  },
  highlightLabel: {
    fontSize: 7.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: '#94a3b8',
  },
  row: {
    flexDirection: 'row',
  },
  main: {
    flex: 1,
    paddingLeft: 30,
    paddingRight: 22,
  },
  aside: {
    width: ASIDE_WIDTH,
    paddingLeft: 16,
    paddingRight: 24,
  },
  mainTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    color: INK,
    marginBottom: 8,
  },
  asideTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    color: INK,
    marginBottom: 6,
  },
  section: {
    marginBottom: 14,
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.55,
    paddingLeft: 10,
    borderLeftWidth: 3,
  },
  // Timeline: a rail down the left, a dot at the top of each entry.
  entry: {
    marginLeft: 4,
    paddingLeft: 14,
    paddingBottom: 7,
    borderLeftWidth: 1.5,
  },
  dot: {
    position: 'absolute',
    top: 1.4,
    left: -5.5,
    width: 9.5,
    height: 9.5,
    borderRadius: 5,
    borderWidth: 2,
    backgroundColor: '#ffffff',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entryTitle: {
    flex: 1,
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: INK,
    paddingRight: 8,
  },
  entryDate: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    lineHeight: 1,
    paddingHorizontal: 6,
    paddingTop: 2.4,
    paddingBottom: 3.6,
    borderRadius: 3,
  },
  entrySubtitle: {
    fontSize: 9.5,
    marginBottom: 3,
    color: '#475569',
  },
  bullet: {
    flexDirection: 'row',
    marginBottom: 1.5,
  },
  bulletMark: {
    width: 9,
    fontFamily: 'Helvetica-Bold',
  },
  bulletText: {
    flex: 1,
  },
  tech: {
    marginTop: 3,
    fontSize: 8.5,
    color: '#64748b',
  },
  techLabel: {
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
  },
  card: {
    marginBottom: 5,
    padding: 6,
    borderWidth: 0.75,
    borderRadius: 4,
  },
  link: {
    color: '#64748b',
    textDecoration: 'none',
  },
  skillGroup: {
    marginBottom: 6,
  },
  skillLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8.5,
    color: '#475569',
    marginBottom: 3,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // Line height 1 + uneven padding, or the text looks off-centre.
  chip: {
    fontSize: 8,
    lineHeight: 1,
    paddingHorizontal: 6,
    paddingTop: 3.4,
    paddingBottom: 2.6,
    marginRight: 3,
    marginBottom: 3,
    borderRadius: 3,
    borderWidth: 0.75,
  },
  legend: {
    fontSize: 7.5,
    color: '#64748b',
    marginTop: 2,
  },
  asideText: {
    fontSize: 9,
    marginBottom: 3,
  },
});

const MainSection = ({ title, accentColor, children }: { title: string; accentColor: string; children: ReactNode }) => (
  <View style={styles.section}>
    <Text minPresenceAhead={60} style={styles.mainTitle}>
      <Text style={{ color: accentColor }}>/ </Text>
      {title}
    </Text>
    {children}
  </View>
);

// Kept whole so a heading never sits alone at a page end. Skills may split.
const AsideSection = ({ title, accentColor, splittable, children }: { title: string; accentColor: string; splittable?: boolean; children: ReactNode }) => (
  <View style={styles.section} wrap={splittable}>
    <Text style={styles.asideTitle}>
      <Text style={{ color: accentColor }}>/ </Text>
      {title}
    </Text>
    {children}
  </View>
);

const TimelineEntry = ({ accentColor, children }: { accentColor: string; children: ReactNode }) => (
  <View style={[styles.entry, { borderLeftColor: tint(accentColor, 0.6) }]}>
    <View style={[styles.dot, { borderColor: accentColor }]} />
    {children}
  </View>
);

const DateBadge = ({ children, accentColor }: { children: string; accentColor: string }) => (
  <Text style={[styles.entryDate, { color: accentColor, backgroundColor: tint(accentColor, 0.88) }]}>{children}</Text>
);

const SkillChips = ({ skills, accentColor }: { skills: Record<string, Skill[]>; accentColor: string }) => (
  <>
    {Object.entries(skills).map(([category, categorySkills]) => (
      <View key={category} style={styles.skillGroup} wrap={false}>
        <Text style={styles.skillLabel}>{category}</Text>
        <View style={styles.chips}>
          {categorySkills.map((skill) => (
            <Text
              key={skill.name}
              style={isStrongSkill(skill)
                ? [styles.chip, { color: '#ffffff', backgroundColor: accentColor, borderColor: accentColor }]
                : [styles.chip, { color: accentColor, borderColor: tint(accentColor, 0.55) }]}
            >
              {skill.name}
            </Text>
          ))}
        </View>
      </View>
    ))}
  </>
);

/** The designed CV. For humans, not ATS parsers. */
export function CVDesignedPage({
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
  contributionStats = {},
  photo,
}: CVDocumentProps) {
  const accentColor = getPrintAccent();
  // Print accent is too dark for the navy band, so lighten it.
  const onDark = tint(accentColor, 0.55);
  const { technicalSkills, softSkills, hasSoftSkills } = getRelevantSkills(style);
  const publicProjects = getPublicProjects(projects, style);
  const sortedExperience = sortExperienceByDate(experience);
  const cvEducation = filterForCV(education);
  const cvLanguages = filterForCV(languages);
  const contactInfo = getContactInfo(siteConfig, email, phone);
  const highlights = getCVHighlights(experience, certifications, publicProjects, contributionStats);
  const summaryText = style.summary || summary;
  const showHobbies = style.showHobbies !== false && hobbies.length > 0;

  return (
    <Page size="A4" style={styles.page} wrap>
      <View fixed style={[styles.asideBackground, { backgroundColor: tint(accentColor, 0.92) }]} />

      <View style={[styles.header, { borderBottomColor: onDark }]}>
        <Svg width={A4_WIDTH} height={DOT_ROWS * DOT_GAP} style={styles.headerPattern}>
          {HEADER_DOTS.map((dot) => <Circle key={dot.key} cx={dot.x} cy={dot.y} r={0.9} fill="#ffffff" fillOpacity={dot.opacity} />)}
        </Svg>
        {/* react-pdf's Image, not an <img>: PDFs have no alt text */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        {photo && <Image src={photo} style={[styles.photo, { borderColor: onDark }]} />}
        <View style={[styles.nameRow, photo ? { paddingRight: PHOTO_SIZE + 16 } : {}]}>
          {siteConfig.fullName.split(' ').map((word) => <Text key={word} style={styles.name}>{word}</Text>)}
        </View>
        <Text style={[styles.role, { color: onDark }]}>{style.name}</Text>
        <View style={[styles.contactRow, photo ? { paddingRight: PHOTO_SIZE + 16 } : {}]}>
          {[...contactInfo.personal, ...contactInfo.links].map((item) => (
            item.href
              ? <Link key={item.text} src={item.href} style={styles.contact}>{item.text}</Link>
              : <Text key={item.text} style={styles.contact}>{item.text}</Text>
          ))}
        </View>
        {highlights.length > 0 && (
          <View style={styles.highlights}>
            {highlights.map((h) => (
              <View key={h.label} style={styles.highlight}>
                <Text style={styles.highlightValue}>{h.value}</Text>
                <Text style={styles.highlightLabel}>{h.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.row}>
        <View style={styles.main}>
          {summaryText && (
            <View style={styles.section} wrap={false}>
              <Text style={[styles.summary, { borderLeftColor: accentColor }]}>{summaryText}</Text>
            </View>
          )}

          <MainSection title="Experience" accentColor={accentColor}>
            {sortedExperience.map((exp) => (
              <TimelineEntry key={exp.id} accentColor={accentColor}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{exp.role}</Text>
                  <DateBadge accentColor={accentColor}>{formatDateRange(exp.startDate, exp.endDate)}</DateBadge>
                </View>
                <Text style={[styles.entrySubtitle, { color: accentColor, fontFamily: 'Helvetica-Bold' }]}>
                  {exp.company}
                  {exp.location && <Text style={{ color: '#64748b', fontFamily: 'Helvetica' }}>{`  ·  ${exp.location}`}</Text>}
                </Text>
                {parseDescription(exp.description).map((point) => (
                  <View key={point} style={styles.bullet} wrap={false}>
                    <Text style={[styles.bulletMark, { color: accentColor }]}>›</Text>
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
                {exp.skills && exp.skills.length > 0 && (
                  <Text style={styles.tech}>
                    <Text style={styles.techLabel}>Stack: </Text>
                    {exp.skills.join(', ')}
                  </Text>
                )}
              </TimelineEntry>
            ))}
          </MainSection>

          {publicProjects.length > 0 && (
            <MainSection title="Projects" accentColor={accentColor}>
              {publicProjects.map((project) => {
                const stats = contributionStats[project.id];
                return (
                  <View key={project.id} style={[styles.card, { borderColor: tint(accentColor, 0.65) }]} wrap={false}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.entryTitle}>
                        {project.name}
                        {project.repository && (
                          <Text style={{ fontFamily: 'Helvetica', fontSize: 8.5, color: '#64748b' }}>
                            {`  ${project.projectType === 'contribution' ? 'Contribution' : 'Personal'}`}
                          </Text>
                        )}
                      </Text>
                      {project.repository && (
                        <Link src={project.repository} style={[styles.link, { fontSize: 8.5 }]}>{stripUrl(project.repository)}</Link>
                      )}
                    </View>
                    <Text>{project.cvDescription || project.description}</Text>
                    {stats && stats.mergedCount > 0 && (
                      <Text style={styles.tech}>
                        <Text style={styles.techLabel}>Contributions: </Text>
                        <Link src={stats.searchUrl} style={styles.link}>
                          {stats.mergedCount} merged PR{stats.mergedCount !== 1 ? 's' : ''}
                        </Link>
                        {stats.reviewCount > 0 && (
                          <>
                            {', '}
                            <Link src={stats.reviewSearchUrl} style={styles.link}>
                              {stats.reviewCount} code review{stats.reviewCount !== 1 ? 's' : ''}
                            </Link>
                          </>
                        )}
                      </Text>
                    )}
                  </View>
                );
              })}
            </MainSection>
          )}

        </View>

        <View style={styles.aside}>
          <AsideSection title="Skills" accentColor={accentColor} splittable>
            <SkillChips skills={technicalSkills} accentColor={accentColor} />
            {hasSoftSkills && <SkillChips skills={softSkills} accentColor={accentColor} />}
          </AsideSection>

          <AsideSection title="Education" accentColor={accentColor}>
            {cvEducation.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 6 }} wrap={false}>
                <Text style={[styles.asideText, { fontFamily: 'Helvetica-Bold', marginBottom: 0 }]}>{edu.degree}{edu.field && `, ${edu.field}`}</Text>
                <Text style={{ fontSize: 8.5, color: '#475569' }}>{edu.institution}{edu.grade && `  ·  ${edu.grade}`}</Text>
                <Text style={{ fontSize: 8, color: '#64748b' }}>
                  {formatDateRange(edu.startDate, edu.endDate)}
                  {edu.thesisUrl && (
                    <>
                      {'  ·  '}
                      <Link src={`https://${siteConfig.domain}${edu.thesisUrl}`} style={styles.link}>Thesis (PDF)</Link>
                    </>
                  )}
                </Text>
              </View>
            ))}
          </AsideSection>

          {cvLanguages.length > 0 && (
            <AsideSection title="Languages" accentColor={accentColor}>
              {cvLanguages.map((lang) => (
                <Text key={lang.id} style={styles.asideText}>
                  <Text style={{ fontFamily: 'Helvetica-Bold' }}>{lang.name}</Text>
                  {' · '}
                  {getProficiencyDisplay(lang)}
                </Text>
              ))}
            </AsideSection>
          )}

          {certifications.length > 0 && (
            <AsideSection title="Certifications" accentColor={accentColor}>
              {certifications.map((cert) => (
                <View key={cert.id} style={{ marginBottom: 5 }} wrap={false}>
                  <Text style={[styles.asideText, { fontFamily: 'Helvetica-Bold', marginBottom: 0 }]}>{cert.name}</Text>
                  <Text style={{ fontSize: 8, color: '#64748b' }}>
                    {cert.issuer} · {formatDateSpan(cert.issueDate, cert.expiryDate)}
                  </Text>
                </View>
              ))}
            </AsideSection>
          )}

          {showHobbies && (
            <AsideSection title="Interests" accentColor={accentColor}>
              <Text style={styles.asideText}>{hobbies.map((h) => h.name).join(', ')}</Text>
            </AsideSection>
          )}
        </View>
      </View>
    </Page>
  );
}

export default function CVDesignedDocument(props: CVDocumentProps) {
  return (
    <Document {...cvMetadata(props.style, props.siteConfig)}>
      <CVDesignedPage {...props} />
    </Document>
  );
}
