'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SiStrava } from 'react-icons/si';
import type { RunningData, RunTotals, WeekStats } from '@/lib/strava';
import { formatDay, formatDuration, formatHours, formatKm, formatPace } from '@/lib/running-format';
import { formatRelativeTime } from '@/lib/format-time';
import { STAGGER_STEP_MS, revealDelay } from '@/lib/motion';
import Reveal from '@/components/Reveal';
import TypedText from '@/components/TypedText';
import Bone from './Skeleton';
import RunHeatmap from './RunHeatmap';
import WeekdayHabit from './WeekdayHabit';
import RunRecordsPanel from './RunRecordsPanel';
import RouteTrace from './RouteTrace';

const EFFORT_LABELS: Record<string, string> = {
  '5K': '5K',
  '10K': '10K',
  'Half-Marathon': 'HALF',
  Marathon: 'MARATHON',
};

const panel = 'border border-[var(--terminal-border)] rounded bg-[var(--terminal-surface)] p-4 sm:p-5';
const label = 'text-[10px] sm:text-xs tracking-widest text-[var(--terminal-text-dim)]';

function Headline({ weeks, ytd, allTime }: { weeks: WeekStats; ytd: RunTotals; allTime: RunTotals }) {
  const hasAvg = weeks.avgWeeks >= 2 && weeks.avgKm > 0;
  const delta = weeks.thisKm - weeks.avgKm;
  const fill = hasAvg ? Math.min(100, (weeks.thisKm / weeks.avgKm) * 100) : 0;
  const stats: [string, string][] = [
    ['LAST WEEK', `${formatKm(weeks.lastKm)} km`],
    [hasAvg ? `${weeks.avgWeeks}-WK AVG` : 'AVG WEEK', hasAvg ? `${formatKm(weeks.avgKm)} km` : '--'],
    ['RUNS / WEEK', hasAvg ? formatKm(weeks.avgRuns) : '--'],
    ['BEST WEEK', `${formatKm(weeks.bestKm)} km`],
  ];

  return (
    <Reveal draw className={`${panel} flex flex-col gap-5`}>
      <div className="flex flex-col gap-3">
        <p className={label}>THIS WEEK</p>
        <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
          <p className="text-4xl sm:text-5xl font-bold text-[var(--terminal-text)] leading-none tabular-nums">
            {formatKm(weeks.thisKm)}
            <span className="text-lg sm:text-xl text-[var(--terminal-text-muted)] font-normal ml-2">km</span>
          </p>
          <p className="text-xs sm:text-sm text-[var(--terminal-text-muted)] tabular-nums pb-0.5">
            {weeks.thisRuns} {weeks.thisRuns === 1 ? 'run' : 'runs'}
            {hasAvg && (
              <span className={`ml-3 ${delta >= 0 ? 'text-primary' : ''}`}>
                {delta >= 0 ? '▲' : '▼'} {formatKm(Math.abs(delta))} km {delta >= 0 ? 'above' : 'below'} average
              </span>
            )}
          </p>
        </div>
        {hasAvg && (
          <div className="h-1.5 rounded-full bg-[var(--terminal-border)] overflow-hidden" aria-hidden="true">
            <div className="h-full rounded-full bg-primary" style={{ width: `${fill}%` }} />
          </div>
        )}
      </div>

      <dl className="flex flex-wrap gap-x-10 gap-y-4 border-t border-[var(--terminal-border)] pt-4">
        {stats.map(([title, value]) => (
          <div key={title} className="flex flex-col gap-1">
            <dt className="text-[var(--terminal-text-dim)] text-[10px] tracking-widest">{title}</dt>
            <dd className="text-[var(--terminal-text)] text-base sm:text-lg tabular-nums whitespace-nowrap">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-x-8 gap-y-1 border-t border-[var(--terminal-border)] pt-3 text-[10px] sm:text-xs tabular-nums">
        <p>
          <span className="tracking-widest text-[var(--terminal-text-dim)] mr-2">{new Date().getFullYear()}</span>
          <span className="text-[var(--terminal-text-muted)]">{formatKm(ytd.distanceKm, 0)} km · {ytd.count} runs · {formatHours(ytd.movingTimeSec)} · {formatPace(ytd.movingTimeSec, ytd.distanceKm)}</span>
        </p>
        <p>
          <span className="tracking-widest text-[var(--terminal-text-dim)] mr-2">ALL TIME</span>
          <span className="text-[var(--terminal-text-muted)]">{formatKm(allTime.distanceKm, 0)} km · {allTime.count} runs</span>
        </p>
      </div>
    </Reveal>
  );
}

export function SectionTitle({ profileUrl }: { profileUrl?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--terminal-border)] pb-3 sm:pb-4">
      <h2 className="text-[var(--terminal-text)] text-base sm:text-lg font-bold flex items-center gap-2">
        <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg sm:text-xl">directions_run</span>
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

const BESTS_POLL_MS = 4000;
const BESTS_MAX_POLLS = 15;

function useRefreshUntilReady(pending: boolean) {
  const router = useRouter();
  const [gaveUp, setGaveUp] = useState(false);

  useEffect(() => {
    if (!pending) return;
    let polls = 0;
    const timer = setInterval(() => {
      if (++polls > BESTS_MAX_POLLS) {
        clearInterval(timer);
        setGaveUp(true);
        return;
      }
      router.refresh();
    }, BESTS_POLL_MS);
    return () => clearInterval(timer);
  }, [pending, router]);

  return gaveUp;
}

export function RunningSkeleton() {
  return (
    <section id="running" aria-busy="true" aria-label="Loading running data" className="flex flex-col gap-4 font-mono scroll-mt-20">
      <SectionTitle />
      <div className={`${panel} flex flex-col gap-3`}>
        <Bone className="h-3 w-28" />
        <Bone className="h-12 w-40" />
        <Bone className="h-8 w-full" />
      </div>
      <div className={panel}>
        <Bone className="h-32 w-full" />
      </div>
      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        <div className={`${panel} lg:w-1/3 flex flex-col gap-3`}>
          <Bone className="h-3 w-28" />
          <Bone className="h-24 w-full" />
        </div>
        <div className={`${panel} lg:w-2/3 flex flex-col gap-3`}>
          <Bone className="h-3 w-28" />
          <Bone className="h-24 w-full" />
        </div>
      </div>
    </section>
  );
}

// `running` is a promise the page does not wait for: the section streams in behind <RunningSkeleton />.
export default function RunningSection({ running }: { running: Promise<RunningData | null> }) {
  const data = use(running);
  const bestsGaveUp = useRefreshUntilReady(data?.bests === null);

  if (!data) {
    return (
      <section id="running" className="flex flex-col gap-4 font-mono scroll-mt-20">
        <SectionTitle />
        <div className={`${panel} flex items-center gap-3 text-xs sm:text-sm text-[var(--terminal-text-muted)]`}>
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--terminal-text-dim)]">cloud_off</span>
          STRAVA_FEED_OFFLINE: activity data is unavailable right now.
        </div>
      </section>
    );
  }

  return (
    <section id="running" className="flex flex-col gap-4 font-mono scroll-mt-20">
      <SectionTitle profileUrl={data.profileUrl} />

      <p className="text-xs sm:text-sm text-[var(--terminal-text-muted)] break-words">
        <span className="text-primary">$</span> strava --summary
        <span className="block sm:inline sm:ml-3 text-[var(--terminal-text)]">
          {formatKm(data.allTime.distanceKm, 0)} km all-time · {data.activeDays} active days · {data.weekStreak}-week streak
        </span>
      </p>

      <Headline weeks={data.weeks} ytd={data.ytd} allTime={data.allTime} />

      <Reveal draw className={panel}>
        <RunHeatmap days={data.heat} weekStreak={data.weekStreak} activeDays={data.activeDays} />
      </Reveal>

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        <div className="lg:w-1/3 lg:self-start flex flex-col gap-3 sm:gap-4">
        {/* Keyed so the panel remounts when the bests arrive: the scroll reveal only watches items present at mount. */}
        <Reveal key={data.bests === null ? 'pending' : 'ready'} draw delay={STAGGER_STEP_MS} className={`${panel} flex flex-col gap-3`}>
          <p className={label}>PERSONAL BESTS</p>
          {data.bests === null ? (
            bestsGaveUp ? (
              <p className="text-xs text-[var(--terminal-text-muted)]">Personal bests are unavailable right now.</p>
            ) : (
              <p className="text-xs text-[var(--terminal-text-muted)] animate-pulse">INDEXING_BEST_EFFORTS...</p>
            )
          ) : data.bests.length === 0 ? (
            <p className="text-xs text-[var(--terminal-text-muted)]">No best efforts recorded yet.</p>
          ) : (
            <ul className="flex flex-col">
              {data.bests.map((pb, index) => (
                <li key={pb.effort} data-reveal style={revealDelay(300 + index * 70)} className="scroll-reveal flex flex-col gap-0.5 border-t border-[var(--terminal-border)] first:border-0 py-2 first:pt-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-2 text-[10px] text-[var(--terminal-text-dim)]">
                    <span className="tracking-widest">{EFFORT_LABELS[pb.effort]}</span>
                    <span className="tabular-nums">{formatDay(pb.date)} {pb.date.slice(0, 4)}</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-lg font-bold text-[var(--terminal-text)] tabular-nums leading-tight">{formatDuration(pb.timeSec)}</span>
                    <span className="text-xs text-[var(--terminal-text-muted)] tabular-nums">{formatPace(pb.timeSec, pb.distanceKm)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
        <WeekdayHabit heat={data.heat} className={panel} />
        {data.records && <RunRecordsPanel records={data.records} bestWeekKm={data.weeks.bestKm} bestWeekStreak={data.bestWeekStreak} className={panel} />}
        </div>

        <Reveal draw delay={STAGGER_STEP_MS * 2} className={`${panel} lg:w-2/3 flex flex-col gap-3 min-w-0`}>
          <p className={label}>RECENT RUNS</p>
          {data.recent.length === 0 ? (
            <p className="text-xs text-[var(--terminal-text-muted)]">No public runs in the last year.</p>
          ) : (
            <ul className="flex-1 grid grid-cols-2 sm:grid-cols-3 sm:grid-rows-2 gap-2 sm:gap-3">
              {data.recent.map((run, index) => (
                <li
                  key={run.id}
                  data-reveal
                  style={revealDelay(300 + index * 70)}
                  className="scroll-reveal flex flex-col gap-2 border border-[var(--terminal-border)] rounded p-3 hover:bg-[var(--terminal-hover-overlay)] transition-colors min-w-0"
                >
                  <div className="flex-1 min-h-[7rem] w-full">
                    <RouteTrace route={run.route} />
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-base font-bold text-[var(--terminal-text)] tabular-nums">{formatKm(run.distanceKm, 2)}<span className="text-[10px] text-[var(--terminal-text-dim)] font-normal ml-0.5">km</span></span>
                    <span className="text-[10px] text-[var(--terminal-text-dim)] whitespace-nowrap">{formatDay(run.date)}</span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-[var(--terminal-text-muted)] truncate" title={run.name}>{run.name}</p>
                  <p className="text-[10px] text-[var(--terminal-text-dim)] tabular-nums">
                    {formatPace(run.movingTimeSec, run.distanceKm)} · {formatDuration(run.movingTimeSec)}{run.elevationM >= 1 && <> · {Math.round(run.elevationM)} m</>}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Reveal>
      </div>

      <p className="text-[10px] text-[var(--terminal-text-dim)] text-right" suppressHydrationWarning>
        synced {formatRelativeTime(data.fetchedAt)} · public activities only
      </p>
    </section>
  );
}
