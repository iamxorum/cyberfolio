'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { RunDay } from '@/lib/strava';
import { formatDay, formatKm } from '@/lib/running-format';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];
// Opacity of the accent per intensity level; level 0 (rest day) stays a faint border-coloured cell.
const LEVEL_OPACITY = [0, 0.3, 0.5, 0.75, 1];

// Relative to the biggest day in the window, so the scale fits however far this runner goes.
const levelFor = (km: number, max: number) => (km <= 0 ? 0 : Math.min(4, Math.ceil((km / max) * 4)));

export default function RunHeatmap({ days, weekStreak, activeDays }: { days: RunDay[]; weekStreak: number; activeDays: number }) {
  const [active, setActive] = useState<number | null>(null);
  const [tipPos, setTipPos] = useState({ left: 0, top: 0 });
  const figure = useRef<HTMLElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const max = Math.max(...days.map((d) => d.distanceKm), 1);
  const total = days.reduce((sum, d) => sum + d.distanceKm, 0);
  const columns = Math.ceil(days.length / 7);

  // Mobile: the grid is wider than the screen, so start at the right edge where "now" is.
  useEffect(() => {
    scroller.current?.scrollTo({ left: scroller.current.scrollWidth });
  }, []);

  // The tooltip lives outside the scroller (which clips overflow), so it is placed from the hovered cell's position.
  const showTip = (index: number, event: MouseEvent<HTMLElement>) => {
    const box = figure.current?.getBoundingClientRect();
    if (!box) return;
    const cell = event.currentTarget.getBoundingClientRect();
    const half = 70;
    setTipPos({
      left: Math.min(Math.max(cell.left - box.left + cell.width / 2, half), box.width - half),
      top: cell.top - box.top,
    });
    setActive(index);
  };

  // A month label sits above the first column whose Monday falls in a new month.
  const monthLabels = Array.from({ length: columns }, (_, col) => {
    const month = Number(days[col * 7].date.slice(5, 7));
    const prev = col > 0 ? Number(days[(col - 1) * 7].date.slice(5, 7)) : -1;
    return month !== prev ? MONTHS[month - 1] : '';
  });

  return (
    <figure ref={figure} className="relative flex flex-col gap-3">
      <figcaption className="flex items-baseline justify-between gap-2 text-[10px] sm:text-xs tracking-widest text-[var(--terminal-text-dim)]">
        <span>LAST 52 WEEKS · {activeDays} ACTIVE DAYS</span>
        <span className="text-[var(--terminal-text-muted)]">{formatKm(total, 0)} km · {weekStreak}-week streak</span>
      </figcaption>

      <div className="flex gap-2">
        <div className="grid grid-rows-7 gap-[3px] pt-4 text-[10px] leading-none text-[var(--terminal-text-dim)] flex-shrink-0" aria-hidden="true">
          {DAY_LABELS.map((label, i) => (
            <span key={i} className="flex items-center">{label}</span>
          ))}
        </div>

        <div ref={scroller} className="flex-1 min-w-0 overflow-x-auto pb-1" onMouseLeave={() => setActive(null)} onScroll={() => setActive(null)}>
          <div className="flex flex-col gap-1 min-w-[640px]">
            <div className="grid gap-[3px] h-3 text-[10px] leading-none text-[var(--terminal-text-dim)]" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} aria-hidden="true">
              {monthLabels.map((label, col) => (
                <span key={col} className="overflow-visible whitespace-nowrap">{label}</span>
              ))}
            </div>

            <div
              className="grid grid-flow-col grid-rows-7 gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
              aria-hidden="true"
            >
              {days.map((day, i) => {
                const level = levelFor(day.distanceKm, max);
                const col = Math.floor(i / 7);
                return (
                  <div key={day.date} className="relative aspect-square" onMouseEnter={(e) => showTip(i, e)}>
                    <div
                      className={`heat-cell absolute inset-0 rounded-[2px] ${level === 0 ? 'bg-[var(--terminal-border)] opacity-40' : 'bg-primary'} ${active === i ? 'ring-1 ring-[var(--terminal-text)]' : ''}`}
                      style={level > 0 ? { opacity: LEVEL_OPACITY[level], animationDelay: `${300 + col * 12}ms` } : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {active !== null && (
        <div
          className="absolute z-10 -translate-x-1/2 -translate-y-full -mt-1.5 px-2.5 py-1.5 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] shadow-lg text-[10px] sm:text-xs whitespace-nowrap pointer-events-none"
          style={{ left: tipPos.left, top: tipPos.top }}
          aria-hidden="true"
        >
          <div className="text-[var(--terminal-text-dim)]">{formatDay(days[active].date)} {days[active].date.slice(0, 4)}</div>
          <div className="text-[var(--terminal-text)] font-bold">{days[active].runs > 0 ? `${formatKm(days[active].distanceKm)} km` : 'rest day'}</div>
          {days[active].runs > 1 && <div className="text-[var(--terminal-text-muted)]">{days[active].runs} runs</div>}
        </div>
      )}

      <div className="flex items-center justify-end gap-1.5 text-[10px] text-[var(--terminal-text-dim)]" aria-hidden="true">
        less
        {LEVEL_OPACITY.map((opacity, level) => (
          <span
            key={level}
            className={`w-2.5 h-2.5 rounded-[2px] ${level === 0 ? 'bg-[var(--terminal-border)] opacity-40' : 'bg-primary'}`}
            style={level > 0 ? { opacity } : undefined}
          />
        ))}
        more
      </div>

      <table className="sr-only">
        <caption>Kilometres run per day, days with a run only</caption>
        <thead>
          <tr><th scope="col">Date</th><th scope="col">Distance (km)</th><th scope="col">Runs</th></tr>
        </thead>
        <tbody>
          {days.filter((d) => d.runs > 0).map((d) => (
            <tr key={d.date}><td>{d.date}</td><td>{formatKm(d.distanceKm)}</td><td>{d.runs}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
