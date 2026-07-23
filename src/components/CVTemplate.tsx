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
} from '@/lib/cv-helpers';

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
}

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
}: CVTemplateProps) {
  const accentColor = style.colorScheme?.primary || '#000000';
  const { technicalSkills, softSkills, hasSoftSkills } = getRelevantSkills(style);
  const publicProjects = getPublicProjects(projects, style);

  const formatDate = (date: string) => {
    return date;
  };

  const sortedExperience = sortExperienceByDate(experience);
  const cvEducation = filterForCV(education);
  const cvLanguages = filterForCV(languages);
  const contactInfo = getContactInfo(siteConfig, email);


  return (
    <div className="cv-template ats-friendly bg-white text-black" style={{ fontFamily: 'Times New Roman, serif', fontSize: '11pt', lineHeight: '1.4' }}>
    {/* Header */}
    <div className="flex justify-between items-start mb-6" style={{ marginBottom: '14pt', paddingBottom: '10pt', borderBottom: `2.5pt solid ${accentColor}`, position: 'relative' }}>
      {/* Left side */}
      <div className="flex-1 text-left">
        <h1 className="mb-1" style={{ fontSize: '22pt', fontWeight: 'bold', marginBottom: '4pt', letterSpacing: '0.8pt', lineHeight: '1.15', color: accentColor }}>
          {siteConfig.fullName}
        </h1>
        {contactInfo.length > 0 && (
          <div style={{ fontSize: '10.5pt', lineHeight: '1.5', color: '#4a4a4a', letterSpacing: '0.1pt' }}>
            {contactInfo.join('  |  ')}
          </div>
        )}
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
      <SectionHeader accentColor={accentColor}>PROFESSIONAL EXPERIENCE</SectionHeader>
      {sortedExperience.map((exp) => {
        const descriptionPoints = parseDescription(exp.description);
        return (
          <div key={exp.id} className="mb-5" style={{ marginBottom: '10pt', pageBreakInside: 'avoid' }}>
            {/* Job Header */}
            <div className="flex justify-between items-start mb-3" style={{ marginBottom: '4pt' }}>
              <div style={{ flex: '1' }}>
                <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2pt', color: '#000', lineHeight: '1.3', letterSpacing: '0.1pt' }}>
                  {exp.role} @ <span style={{ color: accentColor }}>{exp.company}</span>
                  {exp.location && `, ${exp.location}`}
                </h3>
              </div>
              <div style={{ fontSize: '11pt', textAlign: 'right', whiteSpace: 'nowrap', marginLeft: '10pt', color: '#2a2a2a', fontWeight: '600', letterSpacing: '0.1pt' }}>
                {formatDate(exp.startDate)} {exp.endDate ? `- ${formatDate(exp.endDate)}` : '- Present'}
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
                    {formatDate(edu.startDate)} {edu.endDate ? `- ${formatDate(edu.endDate)}` : '- Present'}
                    {edu.grade && ` | ${edu.grade}`}
                  </div>
                </div>
              </div>
            ))}
          </section>

          {/* Certifications */}
          {certifications.length > 0 && (
            <section className="mb-4" style={{ marginBottom: '10pt' }}>
              <SectionHeader accentColor={accentColor}>CERTIFICATIONS</SectionHeader>
              {certifications.map((cert) => (
                <div key={cert.id} className="mb-4" style={{ marginBottom: '6pt', pageBreakInside: 'avoid' }}>
                  <div style={{ fontSize: '12pt', fontWeight: '600', marginBottom: '2pt', color: '#000', letterSpacing: '0.1pt' }}>
                    {cert.name}
                  </div>
                  <div style={{ fontSize: '10.5pt', color: '#2a2a2a', letterSpacing: '0.05pt' }}>
                    {cert.issuer} | {cert.issueDate}
                    {cert.expiryDate && ` - ${cert.expiryDate}`}
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Right Column */}
        <div style={{ flex: '1' }}>
          {/* Technical Skills */}
          <section className="mb-4" style={{ marginBottom: '10pt' }}>
            <SectionHeader accentColor={accentColor}>TECHNICAL SKILLS</SectionHeader>
            {Object.entries(technicalSkills).map(([category, categorySkills]) => (
              <div key={category} className="mb-4" style={{ marginBottom: '6pt' }}>
                <div style={{ fontSize: '12pt', fontWeight: '600', marginBottom: '3pt', color: '#000', letterSpacing: '0.1pt' }}>
                  <strong>{category}:</strong>
                </div>
                <div style={{ fontSize: '10.5pt', marginLeft: '12pt', lineHeight: '1.5', color: '#1a1a1a', letterSpacing: '0.05pt' }}>
                  {categorySkills.map((skill, idx) => (
                    <span key={skill.name}>
                      {skill.name}
                      {idx < categorySkills.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Soft Skills */}
          {hasSoftSkills && (
            <section className="mb-4" style={{ marginBottom: '10pt' }}>
              <SectionHeader accentColor={accentColor}>SOFT SKILLS</SectionHeader>
              {Object.entries(softSkills).map(([category, categorySkills]) => (
                <div key={category} className="mb-4" style={{ marginBottom: '6pt' }}>
                  <div style={{ fontSize: '12pt', fontWeight: '600', marginBottom: '3pt', color: '#000', letterSpacing: '0.1pt' }}>
                    <strong>{category}:</strong>
                  </div>
                  <div style={{ fontSize: '10.5pt', marginLeft: '12pt', lineHeight: '1.5', color: '#1a1a1a', letterSpacing: '0.05pt' }}>
                    {categorySkills.map((skill, idx) => (
                      <span key={skill.name}>
                        {skill.name}
                        {idx < categorySkills.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
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
                      {project.description}
                    </div>
                    {project.repository && (
                      <div style={{ fontSize: '10pt', color: '#3a3a3a', marginTop: '2pt' }}>
                        <strong style={{ color: '#000' }}>Repository:</strong> {stripUrl(project.repository)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Additional Information / Interests */}
          {hobbies.length > 0 && (
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
        <section className="mb-5" style={{ marginBottom: '12pt' }}>
          <SectionHeader accentColor={accentColor}>TECHNICAL SKILLS</SectionHeader>
          {Object.entries(technicalSkills).map(([category, categorySkills]) => (
            <div key={category} className="mb-4" style={{ marginBottom: '6pt' }}>
              <div style={{ fontSize: '12pt', fontWeight: '600', marginBottom: '3pt', color: '#000', letterSpacing: '0.1pt' }}>
                <strong>{category}:</strong>
              </div>
              <div style={{ fontSize: '10.5pt', marginLeft: '12pt', lineHeight: '1.5', color: '#1a1a1a', letterSpacing: '0.05pt' }}>
                {categorySkills.map((skill, idx) => (
                  <span key={skill.name}>
                    {skill.name}
                    {idx < categorySkills.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Soft Skills */}
        {hasSoftSkills && (
          <section className="mb-5" style={{ marginBottom: '12pt' }}>
            <SectionHeader accentColor={accentColor}>SOFT SKILLS</SectionHeader>
            {Object.entries(softSkills).map(([category, categorySkills]) => (
              <div key={category} className="mb-4" style={{ marginBottom: '6pt' }}>
                <div style={{ fontSize: '12pt', fontWeight: '600', marginBottom: '3pt', color: '#000', letterSpacing: '0.1pt' }}>
                  <strong>{category}:</strong>
                </div>
                <div style={{ fontSize: '10.5pt', marginLeft: '12pt', lineHeight: '1.5', color: '#1a1a1a', letterSpacing: '0.05pt' }}>
                  {categorySkills.map((skill, idx) => (
                    <span key={skill.name}>
                      {skill.name}
                      {idx < categorySkills.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Education */}
        <section className="mb-5" style={{ marginBottom: '12pt' }}>
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
                  {formatDate(edu.startDate)} {edu.endDate ? `- ${formatDate(edu.endDate)}` : '- Present'}
                  {edu.grade && ` | ${edu.grade}`}
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Certifications */}
        {certifications.length > 0 && (
          <section className="mb-5" style={{ marginBottom: '12pt' }}>
            <SectionHeader accentColor={accentColor}>CERTIFICATIONS</SectionHeader>
            {certifications.map((cert) => (
              <div key={cert.id} className="mb-4" style={{ marginBottom: '6pt', pageBreakInside: 'avoid' }}>
                <div style={{ fontSize: '12pt', fontWeight: '600', marginBottom: '2pt', color: '#000', letterSpacing: '0.1pt' }}>
                  {cert.name}
                </div>
                <div style={{ fontSize: '10.5pt', color: '#2a2a2a', letterSpacing: '0.05pt' }}>
                  {cert.issuer} | {cert.issueDate}
                  {cert.expiryDate && ` - ${cert.expiryDate}`}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Languages */}
        {cvLanguages.length > 0 && (
          <section className="mb-5" style={{ marginBottom: '12pt' }}>
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
          <section className="mb-5" style={{ marginBottom: '12pt' }}>
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
                    {project.description}
                  </div>
                  {project.repository && (
                    <div style={{ fontSize: '10pt', color: '#3a3a3a', marginTop: '2pt' }}>
                      <strong style={{ color: '#000' }}>Repository:</strong> {stripUrl(project.repository)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Additional Information / Interests */}
        {hobbies.length > 0 && (
          <section className="mb-5" style={{ marginBottom: '12pt' }}>
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
