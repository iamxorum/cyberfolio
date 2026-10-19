'use client';

import PageShell from '@/components/PageShell';
import Discography from '@/components/Discography';
import RunningSection from '@/components/life/RunningSection';
import HobbiesSection from '@/components/about/HobbiesSection';
import { features } from '@/config';
import { lifeTopics } from '@/lib/life-topics';
import type { RunningData } from '@/lib/strava';

const SECTIONS = [
  ...(features.strava ? [{ href: '#running', label: 'RUNNING' }] : []),
  { href: '#off-duty', label: 'OFF_DUTY' },
  ...(features.discography ? [{ href: '#music', label: 'MUSIC' }] : []),
];

export default function LifeClient({ running }: { running: RunningData | null }) {

  return (
    <PageShell crumbs={[{ label: 'life.log', href: '/life' }]} fadeIn gap="gap-6 sm:gap-8">
      <h1 className="sr-only">Life: {lifeTopics()}</h1>
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

      {features.strava && <RunningSection data={running} />}

      <HobbiesSection kind="personal" />

      {features.discography && (
        <section id="music" className="scroll-mt-20">
          <Discography />
        </section>
      )}
    </PageShell>
  );
}
