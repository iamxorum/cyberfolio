'use client';

import { SiSteam } from 'react-icons/si';
import { useState } from 'react';
import type { GamingData, SteamGame } from '@/lib/steam';
import { STAGGER_STEP_MS } from '@/lib/motion';
import { formatRelativeTime } from '@/lib/format-time';
import Reveal from '@/components/Reveal';
import TypedText from '@/components/TypedText';

const panel = 'border border-[var(--terminal-border)] rounded bg-[var(--terminal-surface)] p-4 sm:p-5';
const label = 'text-[10px] sm:text-xs tracking-widest text-[var(--terminal-text-dim)]';

const formatHours = (h: number) => `${h.toLocaleString('en-US', { maximumFractionDigits: 1 })}h`;
const artBox = 'w-[92px] h-[43px] rounded shrink-0 bg-[var(--terminal-surface-alt)]';

// headerUrl is resolved server-side (see steam.ts); a banner that still fails to load gets a placeholder.
function GameArt({ game }: { game: SteamGame }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={`${artBox} flex items-center justify-center border border-[var(--terminal-border)]`}>
        <span aria-hidden="true" className="material-symbols-outlined text-[var(--terminal-text-dim)]">sports_esports</span>
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={game.headerUrl} alt="" loading="lazy" width={92} height={43} onError={() => setFailed(true)} className={`${artBox} object-cover`} />
  );
}

function GameRow({ game, hours }: { game: SteamGame; hours: number }) {
  return (
    <li className="flex items-center gap-3 border-b border-[var(--terminal-border)] last:border-0 pb-2 last:pb-0">
      <GameArt game={game} />
      <span className="flex-1 min-w-0 truncate text-xs sm:text-sm text-[var(--terminal-text)]">{game.name}</span>
      <span className="text-xs sm:text-sm font-bold text-[var(--terminal-text)] tabular-nums">{formatHours(hours)}</span>
    </li>
  );
}

function SectionTitle({ profileUrl }: { profileUrl?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--terminal-border)] pb-3 sm:pb-4">
      <h2 className="text-[var(--terminal-text)] text-base sm:text-lg font-bold flex items-center gap-2">
        <span aria-hidden="true" className="material-symbols-outlined text-primary text-lg sm:text-xl">sports_esports</span>
        <TypedText text="GAMING_LOG" />
      </h2>
      {profileUrl && (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[10px] sm:text-xs text-[var(--terminal-text-dim)] hover:text-primary transition-colors"
        >
          <SiSteam aria-hidden="true" className="text-sm" />
          view on Steam
        </a>
      )}
    </div>
  );
}

export default function GamingSection({ data }: { data: GamingData | null }) {
  if (!data) {
    return (
      <section id="gaming" className="flex flex-col gap-4 font-mono scroll-mt-20">
        <SectionTitle />
        <div className={`${panel} flex items-center gap-3 text-xs sm:text-sm text-[var(--terminal-text-muted)]`}>
          <span aria-hidden="true" className="material-symbols-outlined text-[var(--terminal-text-dim)]">cloud_off</span>
          STEAM_FEED_OFFLINE: game data is unavailable right now.
        </div>
      </section>
    );
  }

  return (
    <section id="gaming" className="flex flex-col gap-4 font-mono scroll-mt-20">
      <SectionTitle profileUrl={data.profileUrl} />

      <div className="flex flex-wrap gap-3 sm:gap-4">
        <Reveal draw className={`${panel} flex-1 min-w-[220px] flex items-center gap-4`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={data.avatarUrl} alt="" width={56} height={56} className="w-14 h-14 rounded border border-[var(--terminal-border)]" />
          <div className="flex flex-col gap-1 min-w-0">
            <p className="text-sm sm:text-base font-bold text-[var(--terminal-text)] truncate">{data.personaName}</p>
            {data.nowPlaying ? (
              <p className="text-xs text-green-400 truncate">
                playing {data.nowPlaying}
              </p>
            ) : (
              <p className="text-xs text-[var(--terminal-text-dim)]">not in a game</p>
            )}
          </div>
        </Reveal>

        <Reveal draw delay={STAGGER_STEP_MS} className={`${panel} flex-1 min-w-[220px] flex flex-col gap-3`}>
          <p className={label}>LIBRARY</p>
          <p className="text-3xl sm:text-4xl font-bold text-[var(--terminal-text)] leading-none">
            {data.gameCount.toLocaleString('en-US')}
            <span className="text-base sm:text-lg text-[var(--terminal-text-muted)] font-normal ml-1">games</span>
          </p>
          <p className="text-xs text-[var(--terminal-text-dim)]">{Math.round(data.totalHours).toLocaleString('en-US')}h played in total</p>
        </Reveal>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        <Reveal draw delay={STAGGER_STEP_MS} className={`${panel} lg:w-1/2 flex flex-col gap-3 min-w-0`}>
          <p className={label}>MOST PLAYED</p>
          <ul className="flex flex-col gap-2">
            {data.top.map((g) => <GameRow key={g.appId} game={g} hours={g.totalHours} />)}
          </ul>
        </Reveal>

        <Reveal draw delay={STAGGER_STEP_MS * 2} className={`${panel} lg:w-1/2 flex flex-col gap-3 min-w-0`}>
          <p className={label}>LAST 2 WEEKS</p>
          {data.recent.length === 0 ? (
            <p className="text-xs text-[var(--terminal-text-muted)]">Nothing played recently.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {data.recent.map((g) => <GameRow key={g.appId} game={g} hours={g.recentHours} />)}
            </ul>
          )}
        </Reveal>
      </div>

      <p className="text-[10px] text-[var(--terminal-text-dim)] text-right" suppressHydrationWarning>
        synced {formatRelativeTime(data.fetchedAt)} · public profile only
      </p>
    </section>
  );
}
