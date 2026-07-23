'use client';

import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import HeroSection from '@/components/HeroSection';
import SystemStats from '@/components/SystemStats';
import ProjectsGrid from '@/components/ProjectsGrid';
import Discography from "@/components/Discography";
import LazyMount from '@/components/LazyMount';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useSystemStats } from '@/hooks/useSystemStats';

const ThreatGlobeSkeleton = () => (
  <div className="flex flex-col gap-6 px-4 py-8 mb-8 border border-[var(--terminal-border)] rounded bg-[rgba(var(--terminal-bg-rgb),0.40)] min-h-[450px] sm:min-h-[550px] items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 matrix-bg opacity-5 pointer-events-none"></div>
    <div className="animate-pulse flex flex-col items-center gap-4 z-10">
      <span className="material-symbols-outlined text-4xl text-primary animate-spin">
        radar
      </span>
      <p className="font-mono text-[var(--terminal-text-dim)] tracking-widest text-sm">
        INITIALIZING_THREAT_MATRIX...
      </p>
      <div className="w-48 h-1 bg-[var(--terminal-surface)] rounded overflow-hidden mt-2">
        <div className="h-full bg-primary w-1/2 animate-[ping_1.5s_ease-in-out_infinite]"></div>
      </div>
    </div>
  </div>
);

const ThreatGlobe = dynamic(() => import('@/components/ThreatGlobe'), {
  ssr: false,
  loading: () => <ThreatGlobeSkeleton />
});

export default function Home() {
  const { initialized, checked, setInitialized, userId } = useAppInitialization();
  const { uptime, responseTime, viewport } = useSystemStats();

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-hidden font-display">
      {checked && !initialized && <InitScreen onInit={() => setInitialized(true)} />}

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
            <ProjectsGrid />
            <LazyMount fallback={<ThreatGlobeSkeleton />}>
              <ThreatGlobe />
            </LazyMount>
            <br/>
            <Discography />
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}