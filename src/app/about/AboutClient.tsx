'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import TurnstileGate from '@/components/TurnstileGate';
import QuickNav from '@/components/about/QuickNav';
import BioSection from '@/components/about/BioSection';
import ProfileCard from '@/components/about/ProfileCard';
import SocialLinks from '@/components/about/SocialLinks';
import SkillsPanel from '@/components/about/SkillsPanel';
import LanguagesSection from '@/components/about/LanguagesSection';
import ExperienceTimeline from '@/components/about/ExperienceTimeline';
import EducationSection from '@/components/about/EducationSection';
import CertificationsSection from '@/components/about/CertificationsSection';
import HobbiesSection from '@/components/about/HobbiesSection';
import { useAppInitialization } from '@/hooks/useAppInitialization';

export default function AboutClient() {
  const { initialized, setInitialized, userId } = useAppInitialization();

  return (
    <>
      {!initialized && <InitScreen onInit={() => setInitialized(true)} />}
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

                  <QuickNav />
                  <BioSection />

                  <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                    {/* Left Column - Profile */}
                    <div className="w-full md:w-1/3 flex flex-col gap-3 sm:gap-4">
                      <ProfileCard userId={userId} />
                      <SocialLinks />
                      <SkillsPanel />
                      <LanguagesSection />
                    </div>
                    {/* Right Column - Experience, Education, Certifications, Hobbies (professional signal first) */}
                    <div className="w-full md:w-2/3 flex flex-col gap-4 sm:gap-6">
                      <ExperienceTimeline />
                      <EducationSection />
                      <CertificationsSection />
                      <HobbiesSection />
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
