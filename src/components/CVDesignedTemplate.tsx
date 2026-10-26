'use client';

import type { CSSProperties, ReactNode } from 'react';
import { usePrintAccent } from '@/hooks/usePrintAccent';
import { tint } from '@/lib/accent';
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
import { NO_CONTRIBUTION_STATS } from '@/lib/github-contributions';
import type { CVTemplateProps } from '@/components/CVTemplate';

const MUTED = '#64748b';

const headingStyle: CSSProperties = { fontWeight: 700, textTransform: 'uppercase', color: INK, margin: 0 };
const plainLink: CSSProperties = { color: 'inherit', textDecoration: 'none' };

const MainSection = ({ title, accentColor, children }: { title: string; accentColor: string; children: ReactNode }) => (
  <section style={{ marginBottom: '14pt' }}>
    <h2 style={{ ...headingStyle, fontSize: '12pt', letterSpacing: '1.6pt', marginBottom: '8pt' }}>
      <span style={{ color: accentColor }}>/ </span>{title}
    </h2>
    {children}
  </section>
);

const AsideSection = ({ title, accentColor, children }: { title: string; accentColor: string; children: ReactNode }) => (
  <section style={{ marginBottom: '14pt' }}>
    <h2 style={{ ...headingStyle, fontSize: '9pt', letterSpacing: '1.4pt', marginBottom: '6pt' }}>
      <span style={{ color: accentColor }}>/ </span>{title}
    </h2>
    {children}
  </section>
);

const DateBadge = ({ children, accentColor }: { children: string; accentColor: string }) => (
  <span style={{ fontSize: '8pt', fontWeight: 700, lineHeight: 1, padding: '3.4pt 6pt 2.6pt', borderRadius: '3pt', color: accentColor, backgroundColor: tint(accentColor, 0.88), whiteSpace: 'nowrap' }}>
    {children}
  </span>
);

const EntryHeader = ({ title, badge }: { title: ReactNode; badge?: ReactNode }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8pt' }}>
    <div style={{ fontWeight: 700, fontSize: '11pt', color: INK }}>{title}</div>
    {badge}
  </div>
);

const TimelineEntry = ({ accentColor, children }: { accentColor: string; children: ReactNode }) => (
  <div style={{ position: 'relative', marginLeft: '4pt', padding: '0 0 7pt 14pt', borderLeft: `1.5pt solid ${tint(accentColor, 0.6)}`, breakInside: 'avoid' }}>
    <span style={{ position: 'absolute', top: '1.4pt', left: '-5.5pt', boxSizing: 'border-box', width: '9.5pt', height: '9.5pt', borderRadius: '50%', border: `2pt solid ${accentColor}`, backgroundColor: '#fff' }} />
    {children}
  </div>
);

const SkillChips = ({ skills, accentColor }: { skills: Record<string, Skill[]>; accentColor: string }) => (
  <>
    {Object.entries(skills).map(([category, categorySkills]) => (
      <div key={category} style={{ marginBottom: '6pt', breakInside: 'avoid' }}>
        <div style={{ fontSize: '8.5pt', fontWeight: 700, color: '#475569', marginBottom: '3pt' }}>{category}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3pt' }}>
          {categorySkills.map((skill) => (
            <span
              key={skill.name}
              style={{
                fontSize: '8pt',
                padding: '3.4pt 6pt 2.6pt',
                lineHeight: 1,
                borderRadius: '3pt',
                border: `0.75pt solid ${isStrongSkill(skill) ? accentColor : tint(accentColor, 0.55)}`,
                color: isStrongSkill(skill) ? '#fff' : accentColor,
                backgroundColor: isStrongSkill(skill) ? accentColor : 'transparent',
              }}
            >
              {skill.name}
            </span>
          ))}
        </div>
      </div>
    ))}
  </>
);

/** Preview of the designed CV. Mirrors CVDesignedDocument, the real download. */
export default function CVDesignedTemplate({
  style,
  siteConfig,
  experience,
  education,
  languages,
  certifications,
  hobbies,
  projects = [],
  summary,
  contributionStats = NO_CONTRIBUTION_STATS,
}: CVTemplateProps) {
  const accentColor = usePrintAccent();
  const onDark = tint(accentColor, 0.55);
  const { technicalSkills, softSkills, hasSoftSkills } = getRelevantSkills(style);
  const publicProjects = getPublicProjects(projects, style);
  const sortedExperience = sortExperienceByDate(experience);
  const cvEducation = filterForCV(education);
  const cvLanguages = filterForCV(languages);
  const contactInfo = getContactInfo(siteConfig);
  const highlights = getCVHighlights(experience, certifications, publicProjects, contributionStats);
  const summaryText = style.summary || summary;
  const showHobbies = style.showHobbies !== false && hobbies.length > 0;

  return (
    <div
      className="cv-template cv-designed"
      style={{
        backgroundColor: PAPER,
        width: '210mm',
        minHeight: '297mm',
        boxSizing: 'border-box',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: '9.3pt',
        lineHeight: 1.38,
        color: '#1f2933',
      }}
    >
      <header style={{ position: 'relative', backgroundColor: INK, borderBottom: `4pt solid ${onDark}`, padding: '26pt 30pt 12pt', overflow: 'hidden', isolation: 'isolate' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: -1,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 0.9pt, transparent 1.1pt)',
            backgroundSize: '13pt 13pt',
            opacity: 0.22,
            maskImage: 'linear-gradient(to right, transparent 15%, #000 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 15%, #000 100%)',
            pointerEvents: 'none',
          }}
        />
        <h1 style={{ fontSize: '32pt', fontWeight: 700, lineHeight: 1.1, color: '#fff', margin: 0 }}>{siteConfig.fullName}</h1>
        <div style={{ fontSize: '12pt', fontWeight: 700, letterSpacing: '0.8pt', textTransform: 'uppercase', color: onDark, margin: '4pt 0 12pt' }}>{style.name}</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '14pt', rowGap: '2pt', fontSize: '8.5pt', color: '#e2e8f0' }}>
          {[...contactInfo.personal, ...contactInfo.links].map((item) => (
            item.href
              ? <a key={item.text} href={item.href} target="_blank" rel="noopener noreferrer" style={plainLink}>{item.text}</a>
              : <span key={item.text}>{item.text}</span>
          ))}
        </div>
        {highlights.length > 0 && (
          <div style={{ display: 'flex', gap: '30pt', marginTop: '10pt', paddingTop: '10pt', borderTop: '0.5pt solid #334155' }}>
            {highlights.map((h) => (
              <div key={h.label}>
                <div style={{ fontSize: '14pt', fontWeight: 700, lineHeight: 1.1, color: '#fff', marginBottom: '3pt' }}>{h.value}</div>
                <div style={{ fontSize: '7.5pt', letterSpacing: '0.6pt', textTransform: 'uppercase', color: '#94a3b8' }}>{h.label}</div>
              </div>
            ))}
          </div>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 34%', alignItems: 'stretch' }}>
        <main style={{ padding: '16pt 22pt 0.4in 30pt' }}>
          {summaryText && (
            <p style={{ fontSize: '10pt', lineHeight: 1.55, margin: '0 0 14pt', paddingLeft: '10pt', borderLeft: `3pt solid ${accentColor}` }}>{summaryText}</p>
          )}

          <MainSection title="Experience" accentColor={accentColor}>
            {sortedExperience.map((exp) => (
              <TimelineEntry key={exp.id} accentColor={accentColor}>
                <EntryHeader title={exp.role} badge={<DateBadge accentColor={accentColor}>{formatDateRange(exp.startDate, exp.endDate)}</DateBadge>} />
                <div style={{ fontWeight: 700, color: accentColor, marginBottom: '3pt' }}>
                  {exp.company}
                  {exp.location && <span style={{ fontWeight: 400, color: MUTED }}>{`  ·  ${exp.location}`}</span>}
                </div>
                {parseDescription(exp.description).map((point) => (
                  <div key={point} style={{ display: 'flex', marginBottom: '1.5pt' }}>
                    <span style={{ width: '9pt', flexShrink: 0, fontWeight: 700, color: accentColor }}>›</span>
                    <span>{point}</span>
                  </div>
                ))}
                {exp.skills && exp.skills.length > 0 && (
                  <div style={{ marginTop: '3pt', fontSize: '8.5pt', color: MUTED }}>
                    <strong style={{ color: '#334155' }}>Stack: </strong>{exp.skills.join(', ')}
                  </div>
                )}
              </TimelineEntry>
            ))}
          </MainSection>

          {publicProjects.length > 0 && (
            <MainSection title="Projects" accentColor={accentColor}>
              {publicProjects.map((project) => {
                const stats = contributionStats[project.id];
                return (
                  <div key={project.id} style={{ marginBottom: '5pt', padding: '6pt', border: `0.75pt solid ${tint(accentColor, 0.65)}`, borderRadius: '4pt', breakInside: 'avoid' }}>
                    <EntryHeader
                      title={
                        <>
                          {project.name}
                          {project.repository && (
                            <span style={{ fontWeight: 400, fontSize: '8.5pt', color: MUTED }}>{`  ${project.projectType === 'contribution' ? 'Contribution' : 'Personal'}`}</span>
                          )}
                        </>
                      }
                      badge={project.repository && (
                        <a href={project.repository} target="_blank" rel="noopener noreferrer" style={{ ...plainLink, fontSize: '8.5pt', color: MUTED }}>{stripUrl(project.repository)}</a>
                      )}
                    />
                    <div>{project.cvDescription || project.description}</div>
                    {stats && stats.mergedCount > 0 && (
                      <div style={{ marginTop: '3pt', fontSize: '8.5pt', color: MUTED }}>
                        <strong style={{ color: '#334155' }}>Contributions: </strong>
                        <a href={stats.searchUrl} target="_blank" rel="noopener noreferrer" style={plainLink}>
                          {stats.mergedCount} merged PR{stats.mergedCount !== 1 ? 's' : ''}
                        </a>
                        {stats.reviewCount > 0 && (
                          <>
                            {', '}
                            <a href={stats.reviewSearchUrl} target="_blank" rel="noopener noreferrer" style={plainLink}>
                              {stats.reviewCount} code review{stats.reviewCount !== 1 ? 's' : ''}
                            </a>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </MainSection>
          )}
        </main>

        <aside style={{ backgroundColor: tint(accentColor, 0.92), padding: '16pt 24pt 0.4in 16pt' }}>
          <AsideSection title="Skills" accentColor={accentColor}>
            <SkillChips skills={technicalSkills} accentColor={accentColor} />
            {hasSoftSkills && <SkillChips skills={softSkills} accentColor={accentColor} />}
          </AsideSection>

          <AsideSection title="Education" accentColor={accentColor}>
            {cvEducation.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '6pt', fontSize: '9pt', breakInside: 'avoid' }}>
                <div style={{ fontWeight: 700 }}>{edu.degree}{edu.field && `, ${edu.field}`}</div>
                <div style={{ fontSize: '8.5pt', color: '#475569' }}>{edu.institution}{edu.grade && `  ·  ${edu.grade}`}</div>
                <div style={{ fontSize: '8pt', color: MUTED }}>
                  {formatDateRange(edu.startDate, edu.endDate)}
                  {edu.thesisUrl && (
                    <>
                      {'  ·  '}
                      <a href={`https://${siteConfig.domain}${edu.thesisUrl}`} target="_blank" rel="noopener noreferrer" style={plainLink}>Thesis (PDF)</a>
                    </>
                  )}
                </div>
              </div>
            ))}
          </AsideSection>

          {cvLanguages.length > 0 && (
            <AsideSection title="Languages" accentColor={accentColor}>
              <div style={{ fontSize: '9pt' }}>
                {cvLanguages.map((lang) => (
                  <div key={lang.id} style={{ marginBottom: '3pt' }}>
                    <strong>{lang.name}</strong> · {getProficiencyDisplay(lang)}
                  </div>
                ))}
              </div>
            </AsideSection>
          )}

          {certifications.length > 0 && (
            <AsideSection title="Certifications" accentColor={accentColor}>
              {certifications.map((cert) => (
                <div key={cert.id} style={{ marginBottom: '5pt', breakInside: 'avoid' }}>
                  <div style={{ fontSize: '9pt', fontWeight: 700 }}>{cert.name}</div>
                  <div style={{ fontSize: '8pt', color: MUTED }}>{cert.issuer} · {formatDateSpan(cert.issueDate, cert.expiryDate)}</div>
                </div>
              ))}
            </AsideSection>
          )}

          {showHobbies && (
            <AsideSection title="Interests" accentColor={accentColor}>
              <div style={{ fontSize: '9pt' }}>{hobbies.map((h) => h.name).join(', ')}</div>
            </AsideSection>
          )}
        </aside>
      </div>
    </div>
  );
}
