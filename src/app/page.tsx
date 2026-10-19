'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import HeroSection from '@/components/HeroSection';
import SystemStats from '@/components/SystemStats';
import ProjectsGrid from '@/components/ProjectsGrid';
import LazyMount from '@/components/LazyMount';
import UltrawideRail from '@/components/UltrawideRail';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useSystemStats } from '@/hooks/useSystemStats';
import { features } from '@/config';

const ThreatGlobe = dynamic(() => import('@/components/ThreatGlobe'), { ssr: false });


export default function Home() {
  const { initialized, setInitialized, userId } = useAppInitialization();
  const { uptime, responseTime, viewport } = useSystemStats(features.systemStats);

  return (
    <div className="uw-shell relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-clip font-display">
      {!initialized && <InitScreen onInit={() => setInitialized(true)} />}

      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="layout-container uw-layout flex h-full grow flex-col">
        <Header />

        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 uw-content flex flex-1 justify-center py-5">
          <div className="layout-content-container uw-column flex flex-col max-w-[960px] w-full flex-1">
            <UltrawideRail>
              <section className="uw-panel uw-panel-hero"><HeroSection /></section>
              <section className="uw-panel uw-panel-projects"><ProjectsGrid /></section>
              {features.systemStats && (
                <section className="uw-panel uw-panel-stats">
                  <SystemStats
                    uptime={uptime}
                    userId={userId}
                    viewport={viewport}
                    responseTime={responseTime}
                  />
                </section>
              )}
              {features.threatGlobe && (
                <section className="uw-panel uw-panel-globe mt-2 pt-6 border-t border-[var(--terminal-border)]">
                  <LazyMount fallback={null} rootMargin="500px">
                    <ThreatGlobe />
                  </LazyMount>
                </section>
              )}
            </UltrawideRail>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}