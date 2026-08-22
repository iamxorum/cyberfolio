'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import SkillsRadar from '@/components/SkillsRadar';
import TurnstileGate from '@/components/TurnstileGate';
import { siteConfig, contentConfig, getTopSkills, getCategories, getSkillsByCategory, getSkillsGroupedByCategory, getScoreFromLevel, hobbies, education, certifications, languages, experience } from '@/config';
import { useAppInitialization } from '@/hooks/useAppInitialization';

export default function AboutClient() {
  const { initialized, setInitialized, userId } = useAppInitialization();
  const [age, setAge] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = getCategories();
  const skillsByCategory = getSkillsGroupedByCategory();


  const getRadarSkills = () => {
    if (selectedCategory) {
      const categorySkills = getSkillsByCategory(selectedCategory);

      return categorySkills.length > 6
        ? categorySkills.sort((a, b) => getScoreFromLevel(b.level) - getScoreFromLevel(a.level)).slice(0, 6)
        : categorySkills;
    }
    return getTopSkills(6);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const calculateAge = () => {
        const birthDate = new Date(
          siteConfig.birthDate.year,
          siteConfig.birthDate.month - 1,
          siteConfig.birthDate.day
        );
        const today = new Date();

        let years = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();


        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          years--;
        }


        const thisYearBirthday = new Date(today.getFullYear(), siteConfig.birthDate.month - 1, siteConfig.birthDate.day);
        if (today < thisYearBirthday) {
          thisYearBirthday.setFullYear(today.getFullYear() - 1);
        }
        const daysSinceBirthday = Math.floor((today.getTime() - thisYearBirthday.getTime()) / (1000 * 60 * 60 * 24));

        setAge(`${years} yrs ${daysSinceBirthday} days`);
      };

      calculateAge();

      const ageInterval = setInterval(calculateAge, 86400000);
      return () => clearInterval(ageInterval);
    }
  }, []);

  const bootOverlay = !initialized && <InitScreen onInit={() => setInitialized(true)} />;

  return (
    <>
      {bootOverlay}
      <TurnstileGate decryptingLabel="VERIFYING..." />
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-hidden font-display animate-fade-in">
      {/* Background Grid Pattern Effect */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="turnstile-gated-content px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 relative z-10">
          <div className="layout-content-container flex flex-col max-w-[960px] w-full flex-1">
            <main id="main-content" tabIndex={-1}>
            <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm font-mono tracking-wide">
                <span className="material-symbols-outlined text-[var(--terminal-text-dim)] text-lg">folder_open</span>
                <Link href="/" className="text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors">~/root</Link>
                <span className="text-[var(--terminal-text-dim)]">/</span>
                <Link href="/about" className="text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors">profile.conf</Link>
                <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
              </div>

              {/* Quick nav | a long page benefits from a table of contents, on mobile and desktop alike. */}
              <nav aria-label="Section jump links" className="flex flex-wrap gap-2 text-[10px] sm:text-xs font-mono">
                {[
                  { href: '#bio', label: 'BIO' },
                  { href: '#experience', label: 'EXPERIENCE' },
                  { href: '#skills', label: 'SKILLS' },
                  { href: '#education', label: 'EDUCATION' },
                  { href: '#certifications', label: 'CERTS' },
                  { href: '#hobbies', label: 'HOBBIES' },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="px-2 py-1 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary active:scale-95 transition-all"
                  >
                    {item.label}
                  </a>
                ))}
              </nav>

              {/* Bio Section | full-width, ahead of the two-column grid below, so the
                  human intro reads before the dense skills/education sidebar on mobile too. */}
              <div id="bio" className="bg-[var(--terminal-bg)] border border-[var(--terminal-border)] rounded relative overflow-hidden scroll-mt-20">
                <div className="bg-[var(--terminal-surface-alt)] px-3 sm:px-4 py-2 border-b border-[var(--terminal-border)] flex justify-between items-center">
                  <span className="text-[10px] sm:text-xs font-mono text-[var(--terminal-text-dim)]">
                    {(() => {
                      const title = contentConfig.about.bio.title;

                      const match = title.match(/cat\s+(.+)/);
                      return match ? match[1] : '/var/log/user_bio.txt';
                    })()}
                  </span>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--terminal-border)]"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-[var(--terminal-border)]"></div>
                  </div>
                </div>
                <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed text-[var(--terminal-text-light)]">
                  <p className="animate-reveal mb-3 sm:mb-4">
                    {(() => {
                      const title = contentConfig.about.bio.title;

                      const promptMatch = title.match(/^(.+?)(\s+)(.+)$/);
                      if (promptMatch) {
                        const [, prompt, space, command] = promptMatch;
                        return (
                          <>
                            <span className="text-primary">{prompt}</span>
                            <span>{space}{command}</span>
                          </>
                        );
                      }

                      return <span className="text-primary">{title}</span>;
                    })()}
                  </p>
                  {contentConfig.about.bio.paragraphs.map((paragraph, index) => (
                    <p key={index} className="animate-reveal mb-3 sm:mb-4" style={{ animationDelay: `${150 + Math.min(index, 6) * 130}ms` }}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                {/* Left Column - Profile */}
                <div className="w-full md:w-1/3 flex flex-col gap-3 sm:gap-4">
                  <div className="animate-reveal bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-1 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-[20%] w-full animate-scan pointer-events-none z-10 opacity-30"></div>
                    <div className="relative bg-[var(--terminal-bg-dark)] aspect-square flex items-center justify-center overflow-hidden mb-0">
                      <div className="absolute inset-0 bg-noise-texture opacity-20"></div>
                      <Image
                        src={siteConfig.profileImage}
                        alt="Profile"
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                        priority
                      />
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
                        <div className="text-[10px] font-mono text-[var(--terminal-text)]">ID: {userId || '------'}</div>
                        <div className="w-2 h-2 rounded-full bg-[var(--terminal-success)] animate-pulse shadow-[0_0_8px_rgba(var(--terminal-success-rgb),0.8)]"></div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-[var(--terminal-border)] space-y-2 sm:space-y-2.5">
                      <div className="text-center">
                        <h1 className="text-[var(--terminal-text)] font-mono text-lg sm:text-xl font-bold tracking-widest glow-text">{siteConfig.username.toUpperCase()}</h1>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm font-mono">
                        <div className="flex items-center justify-between border-b border-[var(--terminal-border)] pb-1.5">
                          <span className="text-[var(--terminal-text-dim)]">AGE_DAYS:</span>
                          <span className="text-[var(--terminal-text)]">{age || '--'}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[var(--terminal-border)] pb-1.5">
                          <span className="text-[var(--terminal-text-dim)]">LOCATION:</span>
                          <span className="text-[var(--terminal-text)]">{siteConfig.location}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[var(--terminal-border)] pb-1.5">
                          <span className="text-[var(--terminal-text-dim)]">ROLE:</span>
                          <span className="text-primary">{siteConfig.role}</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[var(--terminal-border)] pb-1.5">
                          <span className="text-[var(--terminal-text-dim)]">STATUS:</span>
                          <span className="text-green-400">{siteConfig.status}</span>
                        </div>
                        <div className="pt-1">
                          <div className="text-[var(--terminal-text-dim)] mb-1.5">INTERESTED:</div>
                          <div className="flex flex-wrap gap-1.5">
                            {hobbies.slice(0, 3).map((hobby, index) => (
                              <span key={index} className="px-1.5 py-0.5 rounded bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[10px] text-[var(--terminal-text-muted)]">
                                {hobby.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Social Links */}
                  {siteConfig.social && (
                    (siteConfig.social.professional && siteConfig.social.professional.length > 0) ||
                    (siteConfig.social.gaming && siteConfig.social.gaming.length > 0) ||
                    (siteConfig.social.other && siteConfig.social.other.length > 0)
                  ) && (
                      <div className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-3 sm:p-4 font-mono text-xs">
                        <div className="flex items-center gap-2 mb-3 border-b border-[var(--terminal-border)] pb-2">
                          <span className="material-symbols-outlined text-primary text-base">link</span>
                          <span className="text-[var(--terminal-text-dim)] text-[10px] sm:text-xs">SOCIAL_LINKS</span>
                        </div>
                        <div className="flex flex-col gap-3">
                          {/* Professional Links */}
                          {siteConfig.social.professional && siteConfig.social.professional.length > 0 && (
                            <div>
                              <div className="text-[var(--terminal-text-dim)] text-[9px] mb-1.5 uppercase">Professional</div>
                              <div className="flex flex-col gap-2">
                                {siteConfig.social.professional.map((link, index) => (
                                  <a
                                    key={index}
                                    href={link.url.startsWith('mailto:') ? link.url : link.url}
                                    target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary hover:bg-primary/10 transition-all group"
                                  >
                                    {link.icon && (
                                      <span className="material-symbols-outlined text-[var(--terminal-text-muted)] group-hover:text-primary text-base">{link.icon}</span>
                                    )}
                                    <span className="text-[var(--terminal-text-muted)] group-hover:text-primary text-[10px] sm:text-xs">{link.name}</span>
                                    {!link.url.startsWith('mailto:') && (
                                      <span className="ml-auto material-symbols-outlined text-[var(--terminal-text-dim)] group-hover:text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_outward</span>
                                    )}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Gaming Links */}
                          {siteConfig.social.gaming && siteConfig.social.gaming.length > 0 && (
                            <div>
                              <div className="text-[var(--terminal-text-dim)] text-[9px] mb-1.5 uppercase">Gaming</div>
                              <div className="flex flex-col gap-2">
                                {siteConfig.social.gaming.map((link, index) => (
                                  <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-2 py-1.5 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary hover:bg-primary/10 transition-all group"
                                  >
                                    {link.icon && (
                                      <span className="material-symbols-outlined text-[var(--terminal-text-muted)] group-hover:text-primary text-base">{link.icon}</span>
                                    )}
                                    <span className="text-[var(--terminal-text-muted)] group-hover:text-primary text-[10px] sm:text-xs">{link.name}</span>
                                    <span className="ml-auto material-symbols-outlined text-[var(--terminal-text-dim)] group-hover:text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_outward</span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Other Links */}
                          {siteConfig.social.other && siteConfig.social.other.length > 0 && (
                            <div>
                              <div className="text-[var(--terminal-text-dim)] text-[9px] mb-1.5 uppercase">Other</div>
                              <div className="flex flex-col gap-2">
                                {siteConfig.social.other.map((link, index) => (
                                  <a
                                    key={index}
                                    href={link.url.startsWith('mailto:') ? link.url : link.url}
                                    target={link.url.startsWith('mailto:') ? undefined : '_blank'}
                                    rel={link.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
                                    className="flex items-center gap-2 px-2 py-1.5 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary hover:bg-primary/10 transition-all group"
                                  >
                                    {link.icon && (
                                      <span className="material-symbols-outlined text-[var(--terminal-text-muted)] group-hover:text-primary text-base">{link.icon}</span>
                                    )}
                                    <span className="text-[var(--terminal-text-muted)] group-hover:text-primary text-[10px] sm:text-xs">{link.name}</span>
                                    {!link.url.startsWith('mailto:') && (
                                      <span className="ml-auto material-symbols-outlined text-[var(--terminal-text-dim)] group-hover:text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_outward</span>
                                    )}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  <div id="skills" className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-3 sm:p-4 font-mono text-xs scroll-mt-20">
                    <div className="flex justify-between items-center mb-2 sm:mb-3 border-b border-[var(--terminal-border)] pb-2">
                      <span className="text-[var(--terminal-text-dim)] text-[10px] sm:text-xs">SKILLS_MATRIX</span>
                      <span className="text-primary font-bold text-[10px] sm:text-xs">{selectedCategory ? selectedCategory.toUpperCase() : 'ALL'}</span>
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-mono transition-all active:scale-90 ${selectedCategory === null
                          ? 'bg-primary text-[var(--terminal-on-primary)] border border-primary'
                          : 'bg-[var(--terminal-bg)] text-[var(--terminal-text-muted)] border border-[var(--terminal-border)] hover:border-primary hover:text-primary'
                          }`}
                      >
                        ALL
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-mono transition-all active:scale-90 ${selectedCategory === category
                            ? 'bg-primary text-[var(--terminal-on-primary)] border border-primary'
                            : 'bg-[var(--terminal-bg)] text-[var(--terminal-text-muted)] border border-[var(--terminal-border)] hover:border-primary hover:text-primary'
                            }`}
                        >
                          {category.toUpperCase()}
                        </button>
                      ))}
                    </div>

                    {/* Radar Chart */}
                    <SkillsRadar skills={getRadarSkills()} />

                    {/* Skills List */}
                    <div tabIndex={0} role="region" aria-label="Skills list" className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto pr-2 sm:pr-3">
                      {(selectedCategory ? getSkillsByCategory(selectedCategory) : Object.values(skillsByCategory).flat())
                        .sort((a, b) => getScoreFromLevel(b.level) - getScoreFromLevel(a.level))
                        .map((skill, index) => {
                          const score = getScoreFromLevel(skill.level);
                          return (
                            <div key={skill.name} className="animate-reveal flex items-center justify-between text-[9px] sm:text-[10px]" style={{ animationDelay: `${Math.min(index, 10) * 60}ms` }}>
                              <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                                <span className="text-[var(--terminal-text-muted)] truncate">{skill.name}</span>
                                <span className="text-[var(--terminal-text-dim)] hidden sm:inline">({skill.category})</span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                                <div className="w-16 sm:w-20 h-1 sm:h-1.5 bg-[var(--terminal-bg)] border border-[var(--terminal-border)] rounded-sm overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-primary to-blue-500"
                                    style={{ width: `${score}%` }}
                                  ></div>
                                </div>
                                <span className="text-primary font-bold w-7 sm:w-8 text-right text-[9px] sm:text-[10px]">{score}%</span>
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </div>

                  {/* Languages Section */}
                  {languages.length > 0 && (
                    <div className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-3 sm:p-4 font-mono text-xs">
                      <div className="flex justify-between items-center mb-2 sm:mb-3 border-b border-[var(--terminal-border)] pb-2">
                        <span className="text-[var(--terminal-text-dim)] text-[10px] sm:text-xs">LANGUAGES</span>
                      </div>
                      <div className="space-y-2">
                        {languages.map((lang) => (
                          <div key={lang.id} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Image
                                  src={`https://flagcdn.com/w20/${lang.countryCode}.png`}
                                  alt={`${lang.name} flag`}
                                  width={20}
                                  height={15}
                                  style={{ width: '20px', height: '15px' }}
                                  className="rounded-sm"
                                  unoptimized
                                />
                                <span className="text-[var(--terminal-text-muted)] text-[10px] sm:text-xs">{lang.name}</span>
                              </div>
                              {lang.proficiency && (
                                <span className="text-primary text-[9px] sm:text-[10px]">{lang.proficiency}</span>
                              )}
                            </div>
                            {(lang.spoken || lang.written || lang.listening) && (
                              <div className="flex flex-wrap items-center gap-2 text-[9px] sm:text-[10px] ml-7">
                                {lang.spoken && (
                                  <span className="text-[var(--terminal-text-dim)]">
                                    <span className="text-[var(--terminal-text-muted)]">Spoken:</span> <span className="text-[var(--terminal-text)]">{lang.spoken}</span>
                                  </span>
                                )}
                                {lang.written && (
                                  <span className="text-[var(--terminal-text-dim)]">
                                    <span className="text-[var(--terminal-text-muted)]">Written:</span> <span className="text-[var(--terminal-text)]">{lang.written}</span>
                                  </span>
                                )}
                                {lang.listening && (
                                  <span className="text-[var(--terminal-text-dim)]">
                                    <span className="text-[var(--terminal-text-muted)]">Listening:</span> <span className="text-[var(--terminal-text)]">{lang.listening}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Right Column - Experience, Education, Certifications, Hobbies (professional signal first) */}
                <div className="w-full md:w-2/3 flex flex-col gap-4 sm:gap-6">
                  {/* Experience Timeline */}
                  {experience.length > 0 && (
                    <div id="experience" className="border border-[var(--terminal-border)] rounded bg-[var(--terminal-bg)] p-4 scroll-mt-20">
                      <h2 className="text-xs font-mono text-[var(--terminal-text-dim)] mb-3">RECENT_ACTIVITY_LOG</h2>
                      <div className="space-y-3 font-mono text-sm">
                        {[...experience].reverse().map((exp, index) => {
                          const isOngoing = !exp.endDate || exp.endDate.toLowerCase() === 'ongoing';
                          const dateRange = isOngoing
                            ? `${exp.startDate} - Present`
                            : exp.startDate === exp.endDate
                              ? exp.startDate
                              : `${exp.startDate} - ${exp.endDate}`;

                          return (
                            <div key={exp.id} className="animate-reveal flex gap-3 items-start group" style={{ animationDelay: `${Math.min(index, 6) * 120}ms` }}>
                              <div className="text-[var(--terminal-text-dim)] text-xs w-36 flex-shrink-0">
                                <div>{dateRange}</div>
                                {exp.type && (
                                  <div className="mt-1 text-[var(--terminal-text-muted)]">
                                    {exp.type}
                                    {exp.type2 && <span className="ml-1.5">• {exp.type2}</span>}
                                  </div>
                                )}
                              </div>
                              <div className={`w-px self-stretch relative transition-colors ${isOngoing ? 'bg-primary' : 'bg-[var(--terminal-border)] group-hover:bg-primary'}`}>
                                <div className={`absolute top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-colors ${isOngoing ? 'bg-primary shadow-[0_0_4px_rgba(var(--terminal-accent-rgb),0.6)]' : 'bg-[var(--terminal-bg)] border border-[var(--terminal-border)] group-hover:border-primary group-hover:bg-primary'}`}></div>
                              </div>
                              <div className="flex-1 pb-2 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                  <div className="text-[var(--terminal-text)] font-bold group-hover:text-primary transition-colors flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                                    {exp.role}, {exp.company}
                                    {isOngoing && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded border border-primary text-primary font-mono tracking-wider">CURRENT</span>
                                    )}
                                  </div>
                                </div>
                                {exp.description && (
                                  <div className="text-xs text-[var(--terminal-text-muted)] mb-1">{exp.description}</div>
                                )}
                                {exp.location && (
                                  <div className="text-xs text-[var(--terminal-text-dim)] mb-2">{exp.location}</div>
                                )}
                                {exp.skills && exp.skills.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 mt-2">
                                    {exp.skills.map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-0.5 text-xs bg-[var(--terminal-surface-dark)] border border-[var(--terminal-border)] rounded text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary transition-colors"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Education */}
                  {education.length > 0 && (
                    <div id="education" className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-4 sm:p-6 scroll-mt-20">
                      <h2 className="text-[var(--terminal-text)] font-mono text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg sm:text-xl">school</span>
                        <span className="text-sm sm:text-base">EDUCATION</span>
                      </h2>
                      <div className="space-y-4">
                        {education.map((edu) => (
                          <div key={edu.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary/50 transition-colors group">
                            {edu.icon && (
                              <span className="material-symbols-outlined text-primary text-xl sm:text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                                {edu.icon}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base font-mono text-[var(--terminal-text)] font-bold mb-1 group-hover:text-primary transition-colors">
                                {edu.degree}
                                {edu.field && <span className="text-[var(--terminal-text-muted)]"> - {edu.field}</span>}
                              </h3>
                              <p className="text-xs sm:text-sm font-mono text-primary mb-1">{edu.institution}</p>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs font-mono text-[var(--terminal-text-muted)]">
                                <span>{edu.startDate}</span>
                                {edu.endDate && edu.endDate.toLowerCase() !== 'ongoing' && (
                                  <>
                                    <span>-</span>
                                    <span>{edu.endDate}</span>
                                  </>
                                )}
                                {edu.endDate && edu.endDate.toLowerCase() === 'ongoing' && (
                                  <span className="text-green-400">[ONGOING]</span>
                                )}
                                {!edu.endDate && <span className="text-green-400">[ONGOING]</span>}
                                {edu.location && (
                                  <>
                                    <span>•</span>
                                    <span>{edu.location}</span>
                                  </>
                                )}
                                {(() => {
                                  const isOngoing = !edu.endDate || edu.endDate.toLowerCase() === 'ongoing';
                                  const hasGrade = edu.grade && edu.grade.trim() !== '';

                                  if (hasGrade) {
                                    return (
                                      <>
                                        <span>•</span>
                                        <span className="text-primary">Grade: {edu.grade}</span>
                                      </>
                                    );
                                  } else if (!isOngoing) {
                                    return (
                                      <>
                                        <span>•</span>
                                        <span className="text-red-400">[ABANDONED]</span>
                                      </>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                              {edu.description && (
                                <p className="text-[10px] sm:text-xs font-mono text-[var(--terminal-text-muted)] mt-2 leading-relaxed">
                                  {edu.description}
                                </p>
                              )}

                              {edu.thesisUrl && (
                                <div className="mt-3">
                                  <a
                                    href={edu.thesisUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-[var(--terminal-border)] hover:border-primary hover:bg-primary/10 text-[var(--terminal-text)] text-[10px] sm:text-xs font-bold font-mono tracking-wider transition-all group/btn w-fit"
                                  >
                                    <span className="material-symbols-outlined text-sm sm:text-base group-hover/btn:text-primary">
                                      description
                                    </span>
                                    <span>{edu.thesisLabel || 'VIEW_DOC'}</span>
                                  </a>
                                </div>
                              )}

                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {certifications.length > 0 && (
                    <div id="certifications" className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-4 sm:p-6 scroll-mt-20">
                      <h2 className="text-[var(--terminal-text)] font-mono text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg sm:text-xl">verified</span>
                        <span className="text-sm sm:text-base">CERTIFICATIONS</span>
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {certifications.map((cert) => (
                          <div key={cert.id} className="flex items-start gap-2 sm:gap-3 p-3 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary/50 transition-colors group">
                            {cert.icon && (
                              <span className="material-symbols-outlined text-primary text-lg sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                                {cert.icon}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xs sm:text-sm font-mono text-[var(--terminal-text)] font-bold mb-1 group-hover:text-primary transition-colors">
                                {cert.name}
                              </h3>
                              <p className="text-[10px] sm:text-xs font-mono text-primary mb-1">{cert.issuer}</p>
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-mono text-[var(--terminal-text-muted)]">
                                <span>Issued: {cert.issueDate}</span>
                                {cert.expiryDate && (
                                  <>
                                    <span>•</span>
                                    <span>Expires: {cert.expiryDate}</span>
                                  </>
                                )}
                                {!cert.expiryDate && <span className="text-green-400">• No expiry</span>}
                              </div>
                              {cert.credentialId && (
                                <p className="text-[9px] sm:text-[10px] font-mono text-[var(--terminal-text-dim)] mt-1">
                                  ID: {cert.credentialId}
                                </p>
                              )}
                              {cert.credentialUrl && (
                                <a
                                  href={cert.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9px] sm:text-[10px] font-mono text-primary hover:text-blue-400 mt-1 inline-flex items-center gap-1"
                                >
                                  Verify <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                </a>
                              )}
                              {cert.description && (
                                <p className="text-[9px] sm:text-[10px] font-mono text-[var(--terminal-text-muted)] mt-2 leading-relaxed">
                                  {cert.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hobbies */}
                  <div id="hobbies" className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-4 sm:p-6 matrix-bg scroll-mt-20">
                    <h2 className="text-[var(--terminal-text)] font-mono text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg sm:text-xl">favorite</span>
                      <span className="text-sm sm:text-base">INTERESTS & HOBBIES</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {hobbies.map((hobby, index) => (
                        <div key={index} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary/50 transition-colors group">
                          {hobby.icon && (
                            <span className="material-symbols-outlined text-primary text-lg sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                              {hobby.icon}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-mono text-[var(--terminal-text)] font-bold mb-1 group-hover:text-primary transition-colors">
                              {hobby.name}
                            </h3>
                            {hobby.description && (
                              <p className="text-[10px] sm:text-xs font-mono text-[var(--terminal-text-muted)] leading-relaxed">
                                {hobby.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
