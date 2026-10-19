'use client';

import PageShell from '@/components/PageShell';
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

export default function AboutClient() {
  return (
    <PageShell crumbs={[{ label: 'profile.conf', href: '/about' }]} fadeIn>
      {(userId) => (
        <>
          <QuickNav />
          <BioSection />

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="w-full lg:w-1/3 flex flex-col gap-3 sm:gap-4">
              <ProfileCard userId={userId} />
              <SocialLinks />
              <SkillsPanel />
              <LanguagesSection />
              <HobbiesSection kind="professional" compact />
            </div>
            {/* Right Column - Experience, Education, Certifications (professional signal first) */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4 sm:gap-6">
              <ExperienceTimeline />
              <EducationSection />
              <CertificationsSection />
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
