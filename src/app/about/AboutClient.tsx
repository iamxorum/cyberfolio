'use client';

import PageShell from '@/components/PageShell';
import { useUltrawide } from '@/hooks/useUltrawide';
import QuickNav from '@/components/about/QuickNav';
import BioSection from '@/components/about/BioSection';
import BuildNote from '@/components/about/BuildNote';
import ProfileCard from '@/components/about/ProfileCard';
import SocialLinks from '@/components/about/SocialLinks';
import SkillsPanel from '@/components/about/SkillsPanel';
import LanguagesSection from '@/components/about/LanguagesSection';
import ExperienceTimeline from '@/components/about/ExperienceTimeline';
import EducationSection from '@/components/about/EducationSection';
import CertificationsSection from '@/components/about/CertificationsSection';
import HobbiesSection from '@/components/about/HobbiesSection';

export default function AboutClient() {
  const ultrawide = useUltrawide();
  return (
    <PageShell crumbs={[{ label: 'profile.conf', href: '/about' }]} rail>
      {(userId) => (
        <>
          <div className="uw-panel uw-panel-intro flex flex-col gap-4 sm:gap-6 md:gap-8">
            <div className="uw-hide"><QuickNav /></div>
            {ultrawide && <ProfileCard userId={userId} />}
            <BioSection />
            <BuildNote />
          </div>

          <div className="uw-contents flex flex-col lg:flex-row gap-4 sm:gap-6">
            <div className="uw-panel uw-panel-side w-full lg:w-1/3 flex flex-col gap-3 sm:gap-4">
              {!ultrawide && <ProfileCard userId={userId} />}
              <SocialLinks />
              <SkillsPanel />
              <LanguagesSection />
              <HobbiesSection kind="professional" compact />
            </div>
            {/* Right Column - Experience, Education, Certifications (professional signal first) */}
            <div className="uw-contents w-full lg:w-2/3 flex flex-col gap-4 sm:gap-6">
              <div className="uw-panel uw-panel-wide"><ExperienceTimeline /></div>
              <div className="uw-panel uw-panel-side flex flex-col gap-4 sm:gap-6">
                <EducationSection />
                <CertificationsSection />
              </div>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
