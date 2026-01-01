'use client';

import { CVStyle, SiteConfig, Experience, Education, Skill, Language, Certification, Hobby, Project, cvConfig } from '@/config';
import { getSkillsGroupedByCategory } from '@/config';

interface CVTemplateProps {
  style: CVStyle;
  siteConfig: SiteConfig;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  hobbies: Hobby[];
  projects?: Project[];
  summary?: string;
  useColumnLayout?: boolean;
}

export default function CVTemplate({
  style,
  siteConfig,
  experience,
  education,
  skills,
  languages,
  certifications,
  hobbies,
  projects = [],
  summary,
  useColumnLayout = true,
}: CVTemplateProps) {
  const skillsByCategory = getSkillsGroupedByCategory();
  
  
  const getRelevantSkills = () => {
    
    const relevantCategories = style.skillCategories || Object.keys(skillsByCategory);
    const filtered: Record<string, Skill[]> = {};
    
    relevantCategories.forEach(category => {
      if (skillsByCategory[category]) {
        filtered[category] = skillsByCategory[category];
      }
    });
    
    return filtered;
  };

  const relevantSkills = getRelevantSkills();

  
  const showProjects = style.showProjects !== false; 
  const publicProjects = showProjects && projects 
    ? projects.filter(p => p.visibility === 'public')
    : [];

  const formatDate = (date: string) => {
    return date;
  };

  const getProficiencyDisplay = (lang: Language) => {
    if (lang.proficiency) return lang.proficiency;
    return `${lang.spoken || ''}${lang.written ? ` / ${lang.written}` : ''}`;
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

  
  const sortedExperience = [...experience].sort((a, b) => {
    const dateA = parseDate(a.endDate || a.startDate);
    const dateB = parseDate(b.endDate || b.startDate);
    
    
    if (dateA.getTime() === dateB.getTime() && dateA.getFullYear() === 9999) {
      return parseDate(b.startDate).getTime() - parseDate(a.startDate).getTime();
    }
    
    return dateB.getTime() - dateA.getTime();
  });

  
  const linkedinLink = siteConfig.social.professional?.find(s => s.name.toLowerCase().includes('linkedin'));
  const githubLink = siteConfig.social.professional?.find(s => s.name.toLowerCase().includes('github'));
  const website = siteConfig.domain ? `https://${siteConfig.domain}` : '';
  
  
  const contactInfo: string[] = [];
  if (linkedinLink) contactInfo.push(`LinkedIn: ${linkedinLink.url}`);
  if (githubLink) contactInfo.push(`GitHub: ${githubLink.url}`);
  if (website) contactInfo.push(`Website: ${website}`);

  
  const parseDescription = (description: string | undefined): string[] => {
    if (!description) return [];
    
    if (description.includes('•') || description.includes('-')) {
      return description.split(/[•-]/).filter(item => item.trim().length > 0).map(item => item.trim());
    }
    if (description.includes(';')) {
      return description.split(';').filter(item => item.trim().length > 0).map(item => item.trim());
    }
    return [description];
  };

  return (
    <div className="cv-template ats-friendly bg-white text-black" style={{ fontFamily: 'Times New Roman, serif', fontSize: '11pt', lineHeight: '1.4' }}>
      {/* Header */}
      <div className="flex justify-between items-start mb-6" style={{ marginBottom: '14pt', paddingBottom: '10pt', borderBottom: '2.5pt solid black', position: 'relative' }}>
        {/* Left side */}
        <div className="flex-1 text-left">
          <h1 className="mb-1" style={{ fontSize: '22pt', fontWeight: 'bold', marginBottom: '4pt', letterSpacing: '0.8pt', lineHeight: '1.15', color: '#000' }}>
            {siteConfig.fullName}
          </h1>
          {contactInfo.length > 0 && (
            <div style={{ fontSize: '10.5pt', lineHeight: '1.7', color: '#4a4a4a', letterSpacing: '0.1pt' }}>
              {contactInfo.map((info, idx) => (
                <div key={idx} style={{ marginBottom: idx < contactInfo.length - 1 ? '1.5pt' : '0' }}>
                  {info}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right side */}
        {cvConfig.cvProfileImage && (
          <div 
            className="cv-profile-picture" 
            data-pdf-only="true"
            style={{ 
              width: '85pt', 
              height: '85pt', 
              marginLeft: '14pt',
              flexShrink: 0
            }}
          >
            <img 
              src={cvConfig.cvProfileImage} 
              alt={siteConfig.fullName}
              crossOrigin="anonymous"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: '2pt solid #000',
                borderRadius: '3pt'
              }}
            />
          </div>
        )}
      </div>

      {/* Professional Summary */}
      {(style.summary || summary) && (
        <section className="mb-5" style={{ marginBottom: '12pt' }}>
          <h2 className="mb-4" style={{ 
            fontSize: '14pt', 
            fontWeight: 'bold', 
            textTransform: 'uppercase',
            marginBottom: '6pt',
            paddingBottom: '4pt',
            borderBottom: '2pt solid black',
            letterSpacing: '0.8pt',
            color: '#000'
          }}>
            SUMMARY
          </h2>
          <p style={{ fontSize: '11pt', textAlign: 'justify', lineHeight: '1.6', marginBottom: '0', color: '#1a1a1a', textIndent: '0' }}>
            {style.summary || summary}
          </p>
        </section>
      )}

      {/* Work Experience */}
      <section className="mb-5" style={{ marginBottom: '12pt' }}>
        <h2 className="mb-4" style={{ 
          fontSize: '14pt', 
          fontWeight: 'bold', 
          textTransform: 'uppercase',
          marginBottom: '6pt',
          paddingBottom: '4pt',
          borderBottom: '2pt solid black',
          letterSpacing: '0.8pt',
          color: '#000'
        }}>
          PROFESSIONAL EXPERIENCE
        </h2>
        {sortedExperience.map((exp, idx) => {
          const descriptionPoints = parseDescription(exp.description);
          return (
            <div key={exp.id} className="mb-5" style={{ marginBottom: '10pt', pageBreakInside: 'avoid' }}>
              {/* Job Header */}
              <div className="flex justify-between items-start mb-3" style={{ marginBottom: '4pt' }}>
                <div style={{ flex: '1' }}>
                  <h3 style={{ fontSize: '12pt', fontWeight: 'bold', marginBottom: '2pt', color: '#000', lineHeight: '1.3', letterSpacing: '0.1pt' }}>
                    {exp.role} @ {exp.company}
                    {exp.location && `, ${exp.location}`}
                  </h3>
                </div>
                <div style={{ fontSize: '11pt', textAlign: 'right', whiteSpace: 'nowrap', marginLeft: '10pt', color: '#2a2a2a', fontWeight: '600', letterSpacing: '0.1pt' }}>
                  {formatDate(exp.startDate)} {exp.endDate ? `- ${formatDate(exp.endDate)}` : '- Present'}
                </div>
              </div>
              
              {/* Description/Bullet Points */}
              {descriptionPoints.length > 0 && (
                <div style={{ marginLeft: '16pt', marginTop: '4pt' }}>
                  {descriptionPoints.map((point, pointIdx) => (
                    <div key={pointIdx} style={{ fontSize: '11pt', lineHeight: '1.5', marginBottom: '2.5pt', textAlign: 'justify', color: '#1a1a1a', paddingRight: '4pt' }}>
                      • {point}
                    </div>
                  ))}
                </div>
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
              <h2 className="mb-4" style={{ 
                fontSize: '14pt', 
                fontWeight: 'bold', 
                textTransform: 'uppercase',
                marginBottom: '6pt',
                paddingBottom: '4pt',
                borderBottom: '2pt solid black',
                letterSpacing: '0.8pt',
                color: '#000'
              }}>
                EDUCATION
              </h2>
              {education.map((edu) => (
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
                <h2 className="mb-4" style={{ 
                  fontSize: '14pt', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase',
                  marginBottom: '6pt',
                  paddingBottom: '4pt',
                  borderBottom: '2pt solid black',
                  letterSpacing: '0.8pt',
                  color: '#000'
                }}>
                  CERTIFICATIONS
                </h2>
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
              <h2 className="mb-4" style={{ 
                fontSize: '14pt', 
                fontWeight: 'bold', 
                textTransform: 'uppercase',
                marginBottom: '6pt',
                paddingBottom: '4pt',
                borderBottom: '2pt solid black',
                letterSpacing: '0.8pt',
                color: '#000'
              }}>
                TECHNICAL SKILLS
              </h2>
              {Object.entries(relevantSkills).map(([category, categorySkills]) => (
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

            {/* Languages */}
            {languages.length > 0 && (
              <section className="mb-4" style={{ marginBottom: '10pt' }}>
                <h2 className="mb-4" style={{ 
                  fontSize: '14pt', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase',
                  marginBottom: '6pt',
                  paddingBottom: '4pt',
                  borderBottom: '2pt solid black',
                  letterSpacing: '0.8pt',
                  color: '#000'
                }}>
                  LANGUAGES
                </h2>
                <div style={{ fontSize: '11pt', lineHeight: '1.6' }}>
                  {languages.map((lang) => (
                    <div key={lang.id} style={{ marginBottom: '3.5pt', color: '#1a1a1a' }}>
                      <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>{lang.name}:</strong> {getProficiencyDisplay(lang)}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Projects */}
            {publicProjects.length > 0 && (
              <section className="mb-4" style={{ marginBottom: '10pt' }}>
                <h2 className="mb-4" style={{ 
                  fontSize: '14pt', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase',
                  marginBottom: '6pt',
                  paddingBottom: '4pt',
                  borderBottom: '2pt solid black',
                  letterSpacing: '0.8pt',
                  color: '#000'
                }}>
                  PROJECTS
                </h2>
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
                      {project.tags && project.tags.length > 0 && (
                        <div style={{ fontSize: '10pt', fontStyle: 'italic', color: '#3a3a3a', marginTop: '2pt' }}>
                          <strong style={{ fontStyle: 'normal', color: '#000' }}>Technologies:</strong> {project.tags.join(', ')}
                        </div>
                      )}
                      {project.repository && (
                        <div style={{ fontSize: '10pt', color: '#3a3a3a', marginTop: '2pt' }}>
                          <strong style={{ color: '#000' }}>Repository:</strong> {project.repository}
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
                <h2 className="mb-4" style={{ 
                  fontSize: '14pt', 
                  fontWeight: 'bold', 
                  textTransform: 'uppercase',
                  marginBottom: '6pt',
                  paddingBottom: '4pt',
                  borderBottom: '2pt solid black',
                  letterSpacing: '0.8pt',
                  color: '#000'
                }}>
                  ADDITIONAL INFORMATION
                </h2>
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
          {/* Education */}
          <section className="mb-5" style={{ marginBottom: '12pt' }}>
            <h2 className="mb-4" style={{ 
              fontSize: '14pt', 
              fontWeight: 'bold', 
              textTransform: 'uppercase',
              marginBottom: '6pt',
              paddingBottom: '4pt',
              borderBottom: '2pt solid black',
              letterSpacing: '0.8pt',
              color: '#000'
            }}>
              EDUCATION
            </h2>
            {education.map((edu) => (
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

          {/* Technical Skills */}
          <section className="mb-5" style={{ marginBottom: '12pt' }}>
            <h2 className="mb-4" style={{ 
              fontSize: '14pt', 
              fontWeight: 'bold', 
              textTransform: 'uppercase',
              marginBottom: '6pt',
              paddingBottom: '4pt',
              borderBottom: '2pt solid black',
              letterSpacing: '0.8pt',
              color: '#000'
            }}>
              TECHNICAL SKILLS
            </h2>
            {Object.entries(relevantSkills).map(([category, categorySkills]) => (
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

          {/* Certifications */}
          {certifications.length > 0 && (
            <section className="mb-5" style={{ marginBottom: '12pt' }}>
              <h2 className="mb-4" style={{ 
                fontSize: '14pt', 
                fontWeight: 'bold', 
                textTransform: 'uppercase',
                marginBottom: '6pt',
                paddingBottom: '4pt',
                borderBottom: '2pt solid black',
                letterSpacing: '0.8pt',
                color: '#000'
              }}>
                CERTIFICATIONS
              </h2>
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
          {languages.length > 0 && (
            <section className="mb-5" style={{ marginBottom: '12pt' }}>
              <h2 className="mb-4" style={{ 
                fontSize: '14pt', 
                fontWeight: 'bold', 
                textTransform: 'uppercase',
                marginBottom: '6pt',
                paddingBottom: '4pt',
                borderBottom: '2pt solid black',
                letterSpacing: '0.8pt',
                color: '#000'
              }}>
                LANGUAGES
              </h2>
              <div style={{ fontSize: '11pt', lineHeight: '1.6' }}>
                {languages.map((lang) => (
                  <div key={lang.id} style={{ marginBottom: '3.5pt', color: '#1a1a1a' }}>
                    <strong style={{ color: '#000', letterSpacing: '0.1pt' }}>{lang.name}:</strong> {getProficiencyDisplay(lang)}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          {publicProjects.length > 0 && (
            <section className="mb-5" style={{ marginBottom: '12pt' }}>
              <h2 className="mb-4" style={{ 
                fontSize: '14pt', 
                fontWeight: 'bold', 
                textTransform: 'uppercase',
                marginBottom: '6pt',
                paddingBottom: '4pt',
                borderBottom: '2pt solid black',
                letterSpacing: '0.8pt',
                color: '#000'
              }}>
                PROJECTS
              </h2>
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
                    {project.tags && project.tags.length > 0 && (
                      <div style={{ fontSize: '10pt', fontStyle: 'italic', color: '#3a3a3a', marginTop: '2pt' }}>
                        <strong style={{ fontStyle: 'normal', color: '#000' }}>Technologies:</strong> {project.tags.join(', ')}
                      </div>
                    )}
                    {project.repository && (
                      <div style={{ fontSize: '10pt', color: '#3a3a3a', marginTop: '2pt' }}>
                        <strong style={{ color: '#000' }}>Repository:</strong> {project.repository}
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
              <h2 className="mb-4" style={{ 
                fontSize: '14pt', 
                fontWeight: 'bold', 
                textTransform: 'uppercase',
                marginBottom: '6pt',
                paddingBottom: '4pt',
                borderBottom: '2pt solid black',
                letterSpacing: '0.8pt',
                color: '#000'
              }}>
                ADDITIONAL INFORMATION
              </h2>
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
