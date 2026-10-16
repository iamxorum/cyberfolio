'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import Discography from '@/components/Discography';
import RunningSection from '@/components/life/RunningSection';
import HobbiesSection from '@/components/about/HobbiesSection';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import type { RunningData } from '@/lib/strava';

const SECTIONS = [
  { href: '#running', label: 'RUNNING' },
  { href: '#off-duty', label: 'OFF_DUTY' },
  { href: '#music', label: 'MUSIC' },
];

export default function LifeClient({ running }: { running: RunningData | null }) {
  const { initialized, setInitialized } = useAppInitialization();

  return (
    <>
      {!initialized && <InitScreen onInit={() => setInitialized(true)} />}
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-clip font-display animate-fade-in">
        <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
        <div className="layout-container flex h-full grow flex-col">
          <Header />
          <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 relative z-10">
            <div className="layout-content-container flex flex-col max-w-[960px] w-full flex-1">
              <main id="main-content" tabIndex={-1}>
                <div className="flex flex-col gap-6 sm:gap-8">
                  <div className="flex items-center gap-2 text-sm font-mono tracking-wide">
                    <span className="material-symbols-outlined text-[var(--terminal-text-dim)] text-lg">folder_open</span>
                    <Link href="/" className="text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors">~/root</Link>
                    <span className="text-[var(--terminal-text-dim)]">/</span>
                    <Link href="/life" className="text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors">life.log</Link>
                    <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
                  </div>

                  <nav aria-label="Section jump links" className="flex flex-wrap gap-2 text-[10px] sm:text-xs font-mono">
                    {SECTIONS.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="px-2 py-1 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary active:scale-95 transition"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>

                  <RunningSection data={running} />

                  <HobbiesSection kind="personal" />

                  <section id="music" className="scroll-mt-20">
                    <Discography />
                  </section>
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
