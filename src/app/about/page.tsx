'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import SkillsRadar from '@/components/SkillsRadar';
import { siteConfig, contentConfig, getTopSkills, getCategories, getSkillsByCategory, getSkillsGroupedByCategory, getScoreFromLevel, hobbies, education, certifications, languages, experience } from '@/config';

export default function About() {
  const [initialized, setInitialized] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const bioRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

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
      const initTimestamp = localStorage.getItem('iamxorum_initialized');
      const storedUserId = localStorage.getItem('iamxorum_user_id');
      
      const isInitialized = initTimestamp && (Date.now() - parseInt(initTimestamp)) < 24 * 60 * 60 * 1000;
      
      if (isInitialized && storedUserId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserId(storedUserId);
        setInitialized(true);
      } else {
        
        const newUserId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        setUserId(newUserId);
        
        localStorage.setItem('iamxorum_user_id', newUserId);
      }

      
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

  useEffect(() => {
    
    if (profileRef.current) {
      const elements = profileRef.current.querySelectorAll('div');
      animate(Array.from(elements), {
        opacity: [0, 1],
        scale: [0.96, 1],
        delay: stagger(150),
        duration: 900,
        easing: 'easeOutQuad',
      });
    }

    
    if (bioRef.current) {
      const elements = bioRef.current.querySelectorAll('p');
      animate(Array.from(elements), {
        opacity: [0, 0.8, 1],
        scale: [0.99, 1],
        delay: stagger(300),
        duration: 1000,
        easing: 'easeOutQuad',
      });
    }

    
    if (skillsRef.current) {
      const elements = skillsRef.current.querySelectorAll('li');
      animate(Array.from(elements), {
        opacity: [0, 0.6, 1],
        scale: [0.97, 1],
        delay: stagger(100),
        duration: 500,
        easing: 'easeOutQuad',
      });
    }

    
    if (timelineRef.current) {
      const elements = timelineRef.current.querySelectorAll('div[class*="flex gap-3"]');
      animate(Array.from(elements), {
        opacity: [0, 0.9, 1],
        scale: [0.98, 1],
        delay: stagger(250),
        duration: 700,
        easing: 'easeOutQuad',
      });
    }
  }, []);

  if (!initialized) {
    return <InitScreen onInit={() => setInitialized(true)} />;
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-white group/design-root overflow-x-hidden font-display">
      {/* Background Grid Pattern Effect */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 relative z-10">
          <div className="layout-content-container flex flex-col max-w-[960px] w-full flex-1">
            <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
              {/* Breadcrumbs */}
              <div className="flex items-center gap-2 text-sm font-mono tracking-wide">
                <span className="material-symbols-outlined text-[var(--terminal-text-dim)] text-lg">folder_open</span>
                <Link href="/" className="text-[var(--terminal-text-muted)] hover:text-white transition-colors">~/root</Link>
                <span className="text-[var(--terminal-text-dim)]">/</span>
                <Link href="/about" className="text-[var(--terminal-text-muted)] hover:text-white transition-colors">profile</Link>
                <span className="text-[var(--terminal-text-dim)]">/</span>
                <span className="text-primary font-bold">config</span>
                <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
              </div>
              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                {/* Left Column - Profile */}
                <div className="w-full md:w-1/3 flex flex-col gap-3 sm:gap-4" ref={profileRef}>
                <div className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-1 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-[20%] w-full animate-scan pointer-events-none z-10 opacity-30"></div>
                  <div className="relative bg-[var(--terminal-bg-dark)] aspect-square flex items-center justify-center overflow-hidden mb-0">
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                    <Image 
                      src={siteConfig.profileImage} 
                      alt="Profile" 
                      fill
                      className="object-cover"
                      priority
                    />
                      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-10">
                        <div className="text-[10px] font-mono text-white">ID: {userId || '------'}</div>
                        <div className="w-2 h-2 rounded-full bg-[var(--terminal-success)] animate-pulse shadow-[0_0_8px_rgba(var(--terminal-success-rgb),0.8)]"></div>
                      </div>
                  </div>
                  <div className="p-4 border-t border-[var(--terminal-border)] space-y-2 sm:space-y-2.5">
                    <div className="text-center">
                      <h3 className="text-white font-mono text-lg sm:text-xl font-bold tracking-widest glow-text">{siteConfig.username.toUpperCase()}</h3>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm font-mono">
                      <div className="flex items-center justify-between border-b border-[var(--terminal-border)] pb-1.5">
                        <span className="text-[var(--terminal-text-dim)]">AGE_DAYS:</span>
                        <span className="text-white">{age || '--'}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-[var(--terminal-border)] pb-1.5">
                        <span className="text-[var(--terminal-text-dim)]">LOCATION:</span>
                        <span className="text-white">{siteConfig.location}</span>
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
                      <span className="text-gray-400 text-[10px] sm:text-xs">SOCIAL_LINKS</span>
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
                <div className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-3 sm:p-4 font-mono text-xs">
                  <div className="flex justify-between items-center mb-2 sm:mb-3 border-b border-[var(--terminal-border)] pb-2">
                    <span className="text-gray-400 text-[10px] sm:text-xs">SKILLS_MATRIX</span>
                    <span className="text-primary font-bold text-[10px] sm:text-xs">{selectedCategory ? selectedCategory.toUpperCase() : 'ALL'}</span>
                  </div>
                  
                  {/* Category Filters */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-mono transition-all ${
                        selectedCategory === null
                          ? 'bg-primary text-white border border-primary'
                          : 'bg-[var(--terminal-bg)] text-[var(--terminal-text-muted)] border border-[var(--terminal-border)] hover:border-primary hover:text-primary'
                      }`}
                    >
                      ALL
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] font-mono transition-all ${
                          selectedCategory === category
                            ? 'bg-primary text-white border border-primary'
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
                  <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto pr-2 sm:pr-3">
                    {(selectedCategory ? getSkillsByCategory(selectedCategory) : Object.values(skillsByCategory).flat())
                      .sort((a, b) => getScoreFromLevel(b.level) - getScoreFromLevel(a.level))
                      .map((skill) => {
                        const score = getScoreFromLevel(skill.level);
                        return (
                        <div key={skill.name} className="flex items-center justify-between text-[9px] sm:text-[10px]">
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
                      )})}
                  </div>
                </div>
                
                {/* Languages Section */}
                {languages.length > 0 && (
                  <div className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-3 sm:p-4 font-mono text-xs">
                    <div className="flex justify-between items-center mb-2 sm:mb-3 border-b border-[var(--terminal-border)] pb-2">
                      <span className="text-gray-400 text-[10px] sm:text-xs">LANGUAGES</span>
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
                                  <span className="text-[var(--terminal-text-muted)]">Spoken:</span> <span className="text-white">{lang.spoken}</span>
                                </span>
                              )}
                              {lang.written && (
                                <span className="text-[var(--terminal-text-dim)]">
                                  <span className="text-[var(--terminal-text-muted)]">Written:</span> <span className="text-white">{lang.written}</span>
                                </span>
                              )}
                              {lang.listening && (
                                <span className="text-[var(--terminal-text-dim)]">
                                  <span className="text-[var(--terminal-text-muted)]">Listening:</span> <span className="text-white">{lang.listening}</span>
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
              {/* Right Column - Bio, Skills, Timeline */}
              <div className="w-full md:w-2/3 flex flex-col gap-4 sm:gap-6">
                {/* Bio Section */}
                <div className="bg-[var(--terminal-bg)] border border-[var(--terminal-border)] rounded relative overflow-hidden" ref={bioRef}>
                  <div className="bg-[var(--terminal-surface-alt)] px-3 sm:px-4 py-2 border-b border-[var(--terminal-border)] flex justify-between items-center">
                    <span className="text-[10px] sm:text-xs font-mono text-gray-400">
                      {(() => {
                        const title = contentConfig.about.bio.title;
                        
                        const match = title.match(/cat\s+(.+)/);
                        return match ? match[1] : '/var/log/user_bio.txt';
                      })()}
                    </span>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-gray-600"></div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed text-[var(--terminal-text-light)]">
                    <p className="mb-3 sm:mb-4">
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
                      <p key={index} className="mb-3 sm:mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
                {/* Hobbies */}
                <div className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-4 sm:p-6 matrix-bg" ref={skillsRef}>
                  <h3 className="text-white font-mono text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg sm:text-xl">favorite</span>
                    <span className="text-sm sm:text-base">INTERESTS & HOBBIES</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {hobbies.map((hobby, index) => (
                      <div key={index} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary/50 transition-colors group">
                        {hobby.icon && (
                          <span className="material-symbols-outlined text-primary text-lg sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                            {hobby.icon}
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-mono text-white font-bold mb-1 group-hover:text-primary transition-colors">
                            {hobby.name}
                          </h4>
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
                {/* Education */}
                {education.length > 0 && (
                  <div className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-4 sm:p-6">
                    <h3 className="text-white font-mono text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg sm:text-xl">school</span>
                      <span className="text-sm sm:text-base">EDUCATION</span>
                    </h3>
                    <div className="space-y-4">
                      {education.map((edu) => (
                        <div key={edu.id} className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary/50 transition-colors group">
                          {edu.icon && (
                            <span className="material-symbols-outlined text-primary text-xl sm:text-2xl group-hover:scale-110 transition-transform flex-shrink-0">
                              {edu.icon}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm sm:text-base font-mono text-white font-bold mb-1 group-hover:text-primary transition-colors">
                              {edu.degree}
                              {edu.field && <span className="text-[var(--terminal-text-muted)]"> - {edu.field}</span>}
                            </h4>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {certifications.length > 0 && (
                  <div className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-4 sm:p-6">
                    <h3 className="text-white font-mono text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-lg sm:text-xl">verified</span>
                      <span className="text-sm sm:text-base">CERTIFICATIONS</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {certifications.map((cert) => (
                        <div key={cert.id} className="flex items-start gap-2 sm:gap-3 p-3 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary/50 transition-colors group">
                          {cert.icon && (
                            <span className="material-symbols-outlined text-primary text-lg sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                              {cert.icon}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs sm:text-sm font-mono text-white font-bold mb-1 group-hover:text-primary transition-colors">
                              {cert.name}
                            </h4>
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

                {/* Experience Timeline */}
                {experience.length > 0 && (
                  <div className="border border-[var(--terminal-border)] rounded bg-[var(--terminal-bg)] p-4" ref={timelineRef}>
                    <h4 className="text-xs font-mono text-gray-500 mb-3">RECENT_ACTIVITY_LOG</h4>
                    <div className="space-y-3 font-mono text-sm">
                      {[...experience].reverse().map((exp) => {
                        const isOngoing = !exp.endDate || exp.endDate.toLowerCase() === 'ongoing';
                        const dateRange = isOngoing 
                          ? `${exp.startDate} - Present`
                          : exp.startDate === exp.endDate
                          ? exp.startDate
                          : `${exp.startDate} - ${exp.endDate}`;
                        
                        return (
                          <div key={exp.id} className="flex gap-3 items-start group">
                            <div className="text-[var(--terminal-text-dim)] text-xs flex-shrink-0 whitespace-nowrap">
                              <div>
                                {isOngoing ? (
                                  <span>{exp.startDate} - <span className="text-green-400">[ONGOING]</span></span>
                                ) : (
                                  dateRange
                                )}
                              </div>
                              {exp.type && (
                                <div className="mt-1 text-[var(--terminal-text-muted)]">
                                  {exp.type}
                                  {exp.type2 && <span className="ml-1.5">• {exp.type2}</span>}
                                </div>
                              )}
                            </div>
                            <div className="w-px bg-[var(--terminal-border)] self-stretch relative group-hover:bg-primary transition-colors">
                              <div className="absolute top-1.5 -left-1 w-2 h-2 rounded-full bg-[var(--terminal-bg)] border border-[var(--terminal-border)] group-hover:border-primary group-hover:bg-primary transition-colors"></div>
                            </div>
                            <div className="flex-1 pb-2 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="text-white font-bold group-hover:text-primary transition-colors flex-1 min-w-0">
                                  {exp.role} @ {exp.company}
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
              </div>
            </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}

