'use client';

import { SiStrava } from 'react-icons/si';
import type { RunningData, RunTotals } from '@/lib/strava';
import { formatDay, formatDuration, formatHours, formatKm, formatPace } from '@/lib/running-format';
import { formatRelativeTime } from '@/lib/format-time';
import { STAGGER_STEP_MS, revealDelay } from '@/lib/motion';
import Reveal from '@/components/Reveal';
import TypedText from '@/components/TypedText';
import WeeklyDistanceChart from './WeeklyDistanceChart';

const EFFORT_LABELS: Record<string, string> = {
  '5K': '5K',
  '10K': '10K',
  'Half-Marathon': 'HALF',
  Marathon: 'MARATHON',
};

const panel = 'border border-[var(--terminal-border)] rounded bg-[var(--terminal-surface)] p-4 sm:p-5';
const label = 'text-[10px] sm:text-xs tracking-widest text-[var(--terminal-text-dim)]';

function TotalsTile({ title, totals, delay }: { title: string; totals: RunTotals; delay: number }) {
  return (
    <Reveal draw delay={delay} className={`${panel} flex-1 min-w-[220px] flex flex-col gap-3`}>
      <p className={label}>{title}</p>
      <p className="text-3xl sm:text-4xl font-bold text-[var(--terminal-text)] leading-none">
        {formatKm(totals.distanceKm, 0)}
        <span className="text-base sm:text-lg text-[var(--terminal-text-muted)] font-normal ml-1">km</span>
      </p>
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <div><dt className="text-[var(--terminal-text-dim)] text-[10px]">RUNS</dt><dd className="text-[var(--terminal-text)]">{totals.count}</dd></div>
        <div><dt className="text-[var(--terminal-text-dim)] text-[10px]">TIME</dt><dd className="text-[var(--terminal-text)]">{formatHours(totals.movingTimeSec)}</dd></div>
        <div><dt className="text-[var(--terminal-text-dim)] text-[10px]">ELEV</dt><dd className="text-[var(--terminal-text)]">{Math.round(totals.elevationM).toLocaleString('en-US')} m</dd></div>
      </dl>
    </Reveal>
  );
}

function SectionTitle({ profileUrl }: { profileUrl?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--terminal-border)] pb-3 sm:pb-4">
      <h2 className="text-[var(--terminal-text)] text-base sm:text-lg font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-lg sm:text-xl">directions_run</span>
        <TypedText text="RUNNING_LOG" />
      </h2>
      {profileUrl && (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[var(--terminal-text-dim)] hover:text-primary transition-colors"
        >
          <SiStrava aria-hidden="true" className="text-sm" />
          view on Strava
        </a>
      )}
    </div>
  );
}

export default function RunningSection({ data }: { data: RunningData | null }) {
  if (!data) {
    return (
      <section id="running" className="flex flex-col gap-4 font-mono scroll-mt-20">
        <SectionTitle />
        <div className={`${panel} flex items-center gap-3 text-xs sm:text-sm text-[var(--terminal-text-muted)]`}>
          <span className="material-symbols-outlined text-[var(--terminal-text-dim)]">cloud_off</span>
          STRAVA_FEED_OFFLINE: activity data is unavailable right now.
        </div>
      </section>
    );
  }

  return (
    <section id="running" className="flex flex-col gap-4 font-mono scroll-mt-20">
      <SectionTitle profileUrl={data.profileUrl} />

      <div className="flex flex-wrap gap-3 sm:gap-4">
        <TotalsTile title={`${new Date().getFullYear()} · YEAR TO DATE`} totals={data.ytd} delay={0} />
        <TotalsTile title="ALL TIME" totals={data.allTime} delay={STAGGER_STEP_MS} />
      </div>

      <Reveal draw className={panel}>
        <WeeklyDistanceChart weeks={data.weekly} />
      </Reveal>

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        <Reveal draw delay={STAGGER_STEP_MS} className={`${panel} lg:w-1/3 flex flex-col gap-3`}>
          <p className={label}>PERSONAL BESTS</p>
          {data.bests === null ? (
            <p className="text-xs text-[var(--terminal-text-muted)] animate-pulse">INDEXING_BEST_EFFORTS...</p>
          ) : data.bests.length === 0 ? (
            <p className="text-xs text-[var(--terminal-text-muted)]">No best efforts recorded yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.bests.map((pb, index) => (
                <li key={pb.effort} data-reveal style={revealDelay(300 + index * 70)} className="scroll-reveal flex items-baseline justify-between gap-2 border-b border-[var(--terminal-border)] last:border-0 pb-2 last:pb-0">
                  <span className="text-xs text-[var(--terminal-text-dim)]">{EFFORT_LABELS[pb.effort]}</span>
                  <span className="flex flex-col items-end">
                    <span className="text-base font-bold text-[var(--terminal-text)]">{formatDuration(pb.timeSec)}</span>
                    <span className="text-[10px] text-[var(--terminal-text-dim)]">{formatDay(pb.date)} {pb.date.slice(0, 4)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal draw delay={STAGGER_STEP_MS * 2} className={`${panel} lg:w-2/3 flex flex-col gap-3 min-w-0`}>
          <p className={label}>RECENT RUNS</p>
          {data.recent.length === 0 ? (
            <p className="text-xs text-[var(--terminal-text-muted)]">No public runs yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="text-left text-[10px] tracking-widest text-[var(--terminal-text-dim)]">
                    <th scope="col" className="font-normal pb-2 pr-3">DATE</th>
                    <th scope="col" className="font-normal pb-2 pr-3 hidden sm:table-cell">NAME</th>
                    <th scope="col" className="font-normal pb-2 pr-3 text-right">KM</th>
                    <th scope="col" className="font-normal pb-2 pr-3 text-right">PACE</th>
                    <th scope="col" className="font-normal pb-2 text-right">TIME</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((run, index) => (
                    <tr key={run.id} data-reveal style={revealDelay(300 + Math.min(index, 8) * 50)} className="scroll-reveal-fade border-t border-[var(--terminal-border)] hover:bg-[var(--terminal-hover-overlay)] transition-colors">
                      <td className="py-2 pr-3 text-[var(--terminal-text-muted)] whitespace-nowrap">{formatDay(run.date)}</td>
                      <td className="py-2 pr-3 text-[var(--terminal-text)] hidden sm:table-cell max-w-[200px] truncate">{run.name}</td>
                      <td className="py-2 pr-3 text-right text-[var(--terminal-text)] tabular-nums">{formatKm(run.distanceKm, 2)}</td>
                      <td className="py-2 pr-3 text-right text-[var(--terminal-text-muted)] tabular-nums whitespace-nowrap">{formatPace(run.movingTimeSec, run.distanceKm)}</td>
                      <td className="py-2 text-right text-[var(--terminal-text-muted)] tabular-nums">{formatDuration(run.movingTimeSec)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Reveal>
      </div>

      <p className="text-[10px] text-[var(--terminal-text-dim)] text-right" suppressHydrationWarning>
        synced {formatRelativeTime(data.fetchedAt)} · public activities only
      </p>
    </section>
  );
}
