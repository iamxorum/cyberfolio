'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import HeroSection from '@/components/HeroSection';
import SystemStats from '@/components/SystemStats';
import ThreatGlobe from '@/components/ThreatGlobe';
import ProjectsGrid from '@/components/ProjectsGrid';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useSystemStats } from '@/hooks/useSystemStats';

export default function Home() {
  const { initialized, setInitialized, userId } = useAppInitialization();
  const { uptime, responseTime, viewport } = useSystemStats();

  if (!initialized) {
    return <InitScreen onInit={() => setInitialized(true)} />;
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-white group/design-root overflow-x-hidden font-display">
      {/* Background Grid Pattern Effect */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="layout-container flex h-full grow flex-col">
        <Header />

        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] w-full flex-1">
            <HeroSection />
            <SystemStats
              uptime={uptime}
              userId={userId}
              viewport={viewport}
              responseTime={responseTime}
            />
            <ThreatGlobe />
            <ProjectsGrid />
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}