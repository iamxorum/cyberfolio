'use client';

import { CVStyle, SiteConfig, Experience, Education, Language, Certification, Hobby, Project } from '@/config';
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
} from '@/lib/cv-helpers';
import type { ContributionStats } from '@/lib/github-contributions';

interface CVTemplateProps {
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

const SkillsList = ({ skills }: { skills: Record<string, { name: string }[]> }) => (
  <>
    {Object.entries(skills).map(([category, categorySkills]) => (
      <p key={category} style={{ fontSize: '10.5pt', lineHeight: '1.4', marginBottom: '2pt', color: '#1a1a1a', letterSpacing: '0.05pt' }}>
        <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>{category}: </strong>
        {categorySkills.map((skill, idx) => (
          <span key={skill.name}>
            {skill.name}
            {idx < categorySkills.length - 1 ? ', ' : ''}
          </span>
        ))}
      </p>
    ))}
  </>
);

const CertificationsList = ({ certifications, accentColor }: { certifications: Certification[]; accentColor: string }) => (
  <>
    {certifications.map((cert) => (
      <p key={cert.id} style={{ fontSize: '11pt', lineHeight: '1.35', marginBottom: '2pt', color: '#1a1a1a', letterSpacing: '0.05pt' }}>
        <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>{cert.name}</strong>
        {' - '}
        <span style={{ color: accentColor }}>{cert.issuer}</span>
        {' | '}
        <span style={{ fontSize: '10pt', fontStyle: 'italic', color: '#3a3a3a' }}>
          {cert.issueDate}{cert.expiryDate && ` - ${cert.expiryDate}`}
        </span>
      </p>
    ))}
  </>
);

const SectionHeader = ({ children, accentColor }: { children: string; accentColor: string }) => (
  <h2 className="mb-4" style={{
    fontSize: '14pt',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: '6pt',
    paddingBottom: '4pt',
    borderBottom: `2pt solid ${accentColor}`,
    letterSpacing: '0.8pt',
    color: accentColor,
  }}>
    {children}
  </h2>
);

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
  email,
  useColumnLayout = true,
  contributionStats = {},
}: CVTemplateProps) {
  const accentColor = style.colorScheme?.primary || '#000000';
  const { technicalSkills, softSkills, hasSoftSkills } = getRelevantSkills(style);
  const publicProjects = getPublicProjects(projects, style);

  const sortedExperience = sortExperienceByDate(experience);
  const cvEducation = filterForCV(education);
  const cvLanguages = filterForCV(languages);
  const contactInfo = getContactInfo(siteConfig, email, false);


  return (
    <div className="cv-template ats-friendly bg-white text-black" style={{ fontFamily: 'Times New Roman, serif', fontSize: '11pt', lineHeight: '1.4' }}>
    {/* Header */}
    <div className="flex justify-between items-start mb-6" style={{ marginBottom: '14pt', paddingBottom: '10pt', borderBottom: `2.5pt solid ${accentColor}`, position: 'relative' }}>
      {/* Left side */}
      <div className="flex-1 text-left">
        <h1 className="mb-1" style={{ fontSize: '22pt', fontWeight: 'bold', marginBottom: '2pt', letterSpacing: '0.8pt', lineHeight: '1.15', color: accentColor }}>
          {siteConfig.fullName}
        </h1>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '11.5pt', letterSpacing: '0.2pt', marginBottom: '6pt', color: accentColor }}>
          {style.name}
        </div>
        {[contactInfo.personal, contactInfo.links].map((group, groupIdx) => group.length > 0 && (
          <div key={groupIdx} style={{ fontSize: '10.5pt', lineHeight: '1.5', color: '#4a4a4a', letterSpacing: '0.1pt', marginTop: groupIdx > 0 ? '2pt' : 0 }}>
            {group.map((item, idx) => (
              <span key={item.text}>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{item.text}</a>
                ) : item.text}
                {idx < group.length - 1 ? ' | ' : ''}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>

    {/* Professional Summary */}
    {(style.summary || summary) && (
      <section className="mb-5" style={{ marginBottom: '12pt' }}>
        <SectionHeader accentColor={accentColor}>SUMMARY</SectionHeader>
        <p style={{ fontSize: '11pt', textAlign: 'justify', lineHeight: '1.6', marginBottom: '0', color: '#1a1a1a', textIndent: '0' }}>
          {style.summary || summary}
        </p>
      </section>
    )}

    {/* Work Experience */}
    <section className="mb-5" style={{ marginBottom: '12pt' }}>
      <SectionHeader accentColor={accentColor}>EXPERIENCE</SectionHeader>
      {sortedExperience.map((exp) => {
        const descriptionPoints = parseDescription(exp.description);
        return (
          <div key={exp.id} className="mb-5" style={{ marginBottom: '10pt', pageBreakInside: 'avoid' }}>
            {/* Job Header */}
            <div className="mb-3" style={{ marginBottom: '4pt' }}>
              <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2pt', color: '#000', lineHeight: '1.3', letterSpacing: '0.1pt' }}>
                {exp.role}, <span style={{ color: accentColor }}>{exp.company}</span>
                {exp.location && `, ${exp.location}`}
              </h3>
              <div style={{ fontSize: '10.5pt', fontStyle: 'italic', color: '#2a2a2a', letterSpacing: '0.1pt' }}>
                {formatDateRange(exp.startDate, exp.endDate)}
              </div>
            </div>

            {/* Description/Bullet Points */}
            {descriptionPoints.length > 0 && (
              <ul style={{ marginLeft: '16pt', marginTop: '4pt', paddingLeft: '16pt', listStyleType: 'disc' }}>
                {descriptionPoints.map((point, pointIdx) => (
                  <li key={pointIdx} style={{ fontSize: '11pt', lineHeight: '1.5', marginBottom: '2.5pt', textAlign: 'justify', color: '#1a1a1a', paddingRight: '4pt' }}>
                    {point}
                  </li>
                ))}
              </ul>
            )}

            {/* Technologies/Skills */}
            {exp.skills && exp.skills.length > 0 && (
              <div style={{ marginTop: '5pt', fontSize: '10.5pt', fontStyle: 'italic', marginLeft: '16pt', color: '#3a3a3a', paddingRight: '4pt' }}>
                <strong style={{ fontStyle: 'normal', color: '#000' }}>Technologies:</strong> {exp.skills.join(', ')}
              </div>
            )}
          </div>
        );
      })}
    </section>

    {/* Layout: Two Column or Single Column */}
    {useColumnLayout ? (
      /* Two Column Layout */
      <div style={{ display: 'flex', gap: '16pt', marginBottom: '8pt' }}>
        {/* Left Column */}
        <div style={{ flex: '1' }}>
          {/* Education */}
          <section className="mb-4" style={{ marginBottom: '10pt' }}>
            <SectionHeader accentColor={accentColor}>EDUCATION</SectionHeader>
            {cvEducation.map((edu) => (
              <div key={edu.id} className="mb-4" style={{ marginBottom: '7pt', pageBreakInside: 'avoid' }}>
                <div style={{ marginBottom: '2pt' }}>
                  <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2pt', color: '#000', letterSpacing: '0.1pt' }}>
                    {edu.degree}
                    {edu.field && `, ${edu.field}`}
                  </h3>
                  <div style={{ fontSize: '10.5pt', marginBottom: '2pt', color: '#1a1a1a' }}>
                    {edu.institution}
                    {edu.location && `, ${edu.location}`}
                  </div>
                  <div style={{ fontSize: '10pt', fontStyle: 'italic', color: '#3a3a3a', letterSpacing: '0.05pt' }}>
                    {formatDateRange(edu.startDate, edu.endDate)}
                    {edu.grade && ` | ${edu.grade}`}
                  </div>
                  {edu.thesisUrl && (
                    <div style={{ fontSize: '10pt', color: '#3a3a3a', marginTop: '2pt' }}>
                      <strong style={{ color: '#000' }}>Thesis:</strong> <a href={`https://${siteConfig.domain}${edu.thesisUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>View PDF</a> ({stripUrl(`https://${siteConfig.domain}${edu.thesisUrl}`)})
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>

          {/* Certifications */}
          {certifications.length > 0 && (
            <section className="mb-4" style={{ marginBottom: '10pt' }}>
              <SectionHeader accentColor={accentColor}>CERTIFICATIONS</SectionHeader>
              <CertificationsList certifications={certifications} accentColor={accentColor} />
            </section>
          )}
        </div>

        {/* Right Column */}
        <div style={{ flex: '1' }}>
          {/* Technical Skills */}
          <section className="mb-4" style={{ marginBottom: '8pt' }}>
            <SectionHeader accentColor={accentColor}>TECHNICAL SKILLS</SectionHeader>
            <SkillsList skills={technicalSkills} />
          </section>

          {/* Soft Skills */}
          {hasSoftSkills && (
            <section className="mb-4" style={{ marginBottom: '8pt' }}>
              <SectionHeader accentColor={accentColor}>SOFT SKILLS</SectionHeader>
              <SkillsList skills={softSkills} />
            </section>
          )}

          {/* Languages */}
          {cvLanguages.length > 0 && (
            <section className="mb-4" style={{ marginBottom: '10pt' }}>
              <SectionHeader accentColor={accentColor}>LANGUAGES</SectionHeader>
              <div style={{ fontSize: '11pt', lineHeight: '1.5', color: '#1a1a1a' }}>
                {cvLanguages.map((lang, idx) => (
                  <span key={lang.id}>
                    <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>{lang.name}:</strong> {getProficiencyDisplay(lang)}
                    {idx < cvLanguages.length - 1 ? '  |  ' : ''}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {publicProjects.length > 0 && (
            <section className="mb-4" style={{ marginBottom: '10pt' }}>
              <SectionHeader accentColor={accentColor}>PROJECTS</SectionHeader>
              {publicProjects.map((project) => (
                <div key={project.id} className="mb-4" style={{ marginBottom: '6pt', pageBreakInside: 'avoid' }}>
                  <div style={{ marginBottom: '2pt' }}>
                    <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2pt', color: '#000', letterSpacing: '0.1pt' }}>
                      {project.name}
                      {project.repository && (
                        <span style={{ fontSize: '10pt', fontWeight: 'normal', color: '#3a3a3a', marginLeft: '6pt' }}>
                          ({project.projectType === 'contribution' ? 'Contribution' : 'Personal'})
                        </span>
                      )}
                    </h3>
                    <div style={{ fontSize: '10.5pt', lineHeight: '1.5', marginBottom: '2pt', color: '#1a1a1a', textAlign: 'justify' }}>
                      {project.cvDescription || project.description}
                    </div>
                    {(project.repository || (contributionStats[project.id] && contributionStats[project.id]!.mergedCount > 0)) && (
                      <div style={{ fontSize: '10pt', color: '#3a3a3a', marginTop: '2pt' }}>
                        {contributionStats[project.id] && contributionStats[project.id]!.mergedCount > 0 && (
                          <>
                            <strong style={{ color: '#000' }}>Contributions:</strong>{' '}
                            <a href={contributionStats[project.id]!.searchUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                              {contributionStats[project.id]!.mergedCount} merged PR{contributionStats[project.id]!.mergedCount !== 1 ? 's' : ''}
                            </a>
                            {contributionStats[project.id]!.reviewCount > 0 && (
                              <>
                                {', '}
                                <a href={contributionStats[project.id]!.reviewSearchUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                                  {contributionStats[project.id]!.reviewCount} code review{contributionStats[project.id]!.reviewCount !== 1 ? 's' : ''}
                                </a>
                              </>
                            )}
                          </>
                        )}
                        {contributionStats[project.id] && contributionStats[project.id]!.mergedCount > 0 && project.repository ? '   |   ' : ''}
                        {project.repository && (
                          <>
                            <strong style={{ color: '#000' }}>Repository:</strong>{' '}
                            <a href={project.repository} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{stripUrl(project.repository)}</a>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Additional Information / Interests */}
          {style.showHobbies !== false && hobbies.length > 0 && (
            <section className="mb-4" style={{ marginBottom: '10pt' }}>
              <SectionHeader accentColor={accentColor}>ADDITIONAL INFORMATION</SectionHeader>
              <div style={{ fontSize: '11pt', lineHeight: '1.6', color: '#1a1a1a' }}>
                <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>Interests:</strong> {hobbies.map((hobby, idx) => (
                  <span key={idx}>
                    {hobby.name}
                    {idx < hobbies.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    ) : (
      /* Single Column Layout */
      <>
        {/* Technical Skills */}
        <section className="mb-5" style={{ marginBottom: '10pt' }}>
          <SectionHeader accentColor={accentColor}>TECHNICAL SKILLS</SectionHeader>
          <SkillsList skills={technicalSkills} />
        </section>

        {/* Soft Skills */}
        {hasSoftSkills && (
          <section className="mb-5" style={{ marginBottom: '10pt' }}>
            <SectionHeader accentColor={accentColor}>SOFT SKILLS</SectionHeader>
            <SkillsList skills={softSkills} />
          </section>
        )}

        {/* Education */}
        <section className="mb-5" style={{ marginBottom: '9pt' }}>
          <SectionHeader accentColor={accentColor}>EDUCATION</SectionHeader>
          {cvEducation.map((edu) => (
            <div key={edu.id} className="mb-4" style={{ marginBottom: '7pt', pageBreakInside: 'avoid' }}>
              <div style={{ marginBottom: '2pt' }}>
                <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2pt', color: '#000', letterSpacing: '0.1pt' }}>
                  {edu.degree}
                  {edu.field && `, ${edu.field}`}
                </h3>
                <div style={{ fontSize: '10.5pt', marginBottom: '2pt', color: '#1a1a1a' }}>
                  {edu.institution}
                  {edu.location && `, ${edu.location}`}
                </div>
                <div style={{ fontSize: '10pt', fontStyle: 'italic', color: '#3a3a3a', letterSpacing: '0.05pt' }}>
                  {formatDateRange(edu.startDate, edu.endDate)}
                  {edu.grade && ` | ${edu.grade}`}
                </div>
                {edu.thesisUrl && (
                  <div style={{ fontSize: '10pt', color: '#3a3a3a', marginTop: '2pt' }}>
                    <strong style={{ color: '#000' }}>Thesis:</strong> <a href={`https://${siteConfig.domain}${edu.thesisUrl}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>View PDF</a> ({stripUrl(`https://${siteConfig.domain}${edu.thesisUrl}`)})
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        {/* Certifications */}
        {certifications.length > 0 && (
          <section className="mb-5" style={{ marginBottom: '9pt' }}>
            <SectionHeader accentColor={accentColor}>CERTIFICATIONS</SectionHeader>
            <CertificationsList certifications={certifications} accentColor={accentColor} />
          </section>
        )}

        {/* Languages */}
        {cvLanguages.length > 0 && (
          <section className="mb-5" style={{ marginBottom: '9pt' }}>
            <SectionHeader accentColor={accentColor}>LANGUAGES</SectionHeader>
            <div style={{ fontSize: '11pt', lineHeight: '1.5', color: '#1a1a1a' }}>
              {cvLanguages.map((lang, idx) => (
                <span key={lang.id}>
                  <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>{lang.name}:</strong> {getProficiencyDisplay(lang)}
                  {idx < cvLanguages.length - 1 ? '  |  ' : ''}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {publicProjects.length > 0 && (
          <section className="mb-5" style={{ marginBottom: '9pt' }}>
            <SectionHeader accentColor={accentColor}>PROJECTS</SectionHeader>
            {publicProjects.map((project) => (
              <div key={project.id} className="mb-4" style={{ marginBottom: '6pt', pageBreakInside: 'avoid' }}>
                <div style={{ marginBottom: '2pt' }}>
                  <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2pt', color: '#000', letterSpacing: '0.1pt' }}>
                    {project.name}
                    {project.repository && (
                      <span style={{ fontSize: '10pt', fontWeight: 'normal', color: '#3a3a3a', marginLeft: '6pt' }}>
                        ({project.projectType === 'contribution' ? 'Contribution' : 'Personal'})
                      </span>
                    )}
                  </h3>
                  <div style={{ fontSize: '10.5pt', lineHeight: '1.5', marginBottom: '2pt', color: '#1a1a1a', textAlign: 'justify' }}>
                    {project.cvDescription || project.description}
                  </div>
                  {(project.repository || (contributionStats[project.id] && contributionStats[project.id]!.mergedCount > 0)) && (
                    <div style={{ fontSize: '10pt', color: '#3a3a3a', marginTop: '2pt' }}>
                      {contributionStats[project.id] && contributionStats[project.id]!.mergedCount > 0 && (
                        <>
                          <strong style={{ color: '#000' }}>Contributions:</strong>{' '}
                          <a href={contributionStats[project.id]!.searchUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                            {contributionStats[project.id]!.mergedCount} merged PR{contributionStats[project.id]!.mergedCount !== 1 ? 's' : ''}
                          </a>
                          {contributionStats[project.id]!.reviewCount > 0 && (
                            <>
                              {', '}
                              <a href={contributionStats[project.id]!.reviewSearchUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                                {contributionStats[project.id]!.reviewCount} code review{contributionStats[project.id]!.reviewCount !== 1 ? 's' : ''}
                              </a>
                            </>
                          )}
                        </>
                      )}
                      {contributionStats[project.id] && contributionStats[project.id]!.mergedCount > 0 && project.repository ? '   |   ' : ''}
                      {project.repository && (
                        <>
                          <strong style={{ color: '#000' }}>Repository:</strong>{' '}
                          <a href={project.repository} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{stripUrl(project.repository)}</a>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Additional Information / Interests */}
        {style.showHobbies !== false && hobbies.length > 0 && (
          <section className="mb-5" style={{ marginBottom: '9pt' }}>
            <SectionHeader accentColor={accentColor}>ADDITIONAL INFORMATION</SectionHeader>
            <div style={{ fontSize: '11pt', lineHeight: '1.6', color: '#1a1a1a' }}>
              <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>Interests:</strong> {hobbies.map((hobby, idx) => (
                <span key={idx}>
                  {hobby.name}
                  {idx < hobbies.length - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </section>
        )}
      </>
    )}
    </div>
  );

}
