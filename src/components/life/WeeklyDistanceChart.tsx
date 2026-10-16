'use client';

import { useState } from 'react';
import type { WeeklyDistance } from '@/lib/strava';
import { formatDay, formatKm } from '@/lib/running-format';

const CHART_HEIGHT = 160;

const niceMax = (value: number) => {
  if (value <= 0) return 10;
  const step = value <= 20 ? 5 : value <= 60 ? 10 : 20;
  return Math.ceil(value / step) * step;
};

export default function WeeklyDistanceChart({ weeks }: { weeks: WeeklyDistance[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...weeks.map((w) => w.distanceKm)));
  const peakIndex = weeks.reduce((best, w, i) => (w.distanceKm > weeks[best].distanceKm ? i : best), 0);
  const ticks = [max, max / 2, 0];
  const total = weeks.reduce((sum, w) => sum + w.distanceKm, 0);

  return (
    <figure className="flex flex-col gap-3">
      <figcaption className="flex items-baseline justify-between gap-2 text-[10px] sm:text-xs tracking-widest text-[var(--terminal-text-dim)]">
        <span>KM / WEEK · LAST {weeks.length} WEEKS</span>
        <span className="text-[var(--terminal-text-muted)]">{formatKm(total)} km total</span>
      </figcaption>

      <div className="flex gap-2">
        {/* Y axis */}
        <div className="flex flex-col justify-between text-[10px] text-[var(--terminal-text-dim)] text-right w-6 flex-shrink-0" style={{ height: CHART_HEIGHT }} aria-hidden="true">
          {ticks.map((t) => (
            <span key={t} className="leading-none -translate-y-1/2 first:translate-y-0 last:translate-y-0">{t}</span>
          ))}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="relative" style={{ height: CHART_HEIGHT }} onMouseLeave={() => setActive(null)}>
            {/* Recessive grid */}
            {ticks.map((t) => (
              <div
                key={t}
                className="absolute left-0 right-0 border-t border-dashed border-[var(--terminal-border)] opacity-60 pointer-events-none"
                style={{ bottom: `${(t / max) * 100}%` }}
                aria-hidden="true"
              />
            ))}

            <div className="absolute inset-0 flex items-end gap-1 sm:gap-1.5" aria-hidden="true">
              {weeks.map((w, i) => {
                const isActive = active === i;
                const heightPct = (w.distanceKm / max) * 100;
                return (
                  <div
                    key={w.weekStart}
                    className="relative flex-1 h-full flex items-end"
                    onMouseEnter={() => setActive(i)}
                  >
                    <div
                      className={`w-full rounded-t-[4px] transition-[background-color,opacity] duration-150 ${
                        isActive ? 'bg-primary' : active === null ? 'bg-primary/80' : 'bg-primary/40'
                      }`}
                      style={{ height: w.distanceKm > 0 ? `max(${heightPct}%, 2px)` : 0 }}
                    />
                    {i === peakIndex && w.distanceKm > 0 && active === null && (
                      <span
                        className="absolute left-1/2 -translate-x-1/2 text-[10px] text-[var(--terminal-text-muted)] whitespace-nowrap pointer-events-none"
                        style={{ bottom: `calc(${heightPct}% + 4px)` }}
                      >
                        {formatKm(w.distanceKm)}
                      </span>
                    )}
                    {isActive && (
                      <div
                        className={`absolute z-10 px-2.5 py-1.5 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] shadow-lg text-[10px] sm:text-xs whitespace-nowrap pointer-events-none ${
                          i < 2 ? 'left-0' : i > weeks.length - 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                        }`}
                        style={{ bottom: `calc(${Math.min(heightPct, 100)}% + 6px)` }}
                      >
                        <div className="text-[var(--terminal-text-dim)]">week of {formatDay(w.weekStart)}</div>
                        <div className="text-[var(--terminal-text)] font-bold">{formatKm(w.distanceKm)} km</div>
                        <div className="text-[var(--terminal-text-muted)]">{w.runs} {w.runs === 1 ? 'run' : 'runs'}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* X axis: every third week keeps labels from colliding at phone width */}
          <div className="flex gap-1 sm:gap-1.5 text-[10px] text-[var(--terminal-text-dim)]" aria-hidden="true">
            {weeks.map((w, i) => (
              <span key={w.weekStart} className="flex-1 text-center whitespace-nowrap overflow-visible">
                {(weeks.length - 1 - i) % 3 === 0 ? formatDay(w.weekStart) : ''}
              </span>
            ))}
          </div>
        </div>
      </div>

      <table className="sr-only">
        <caption>Kilometres run per week</caption>
        <thead>
          <tr><th scope="col">Week of</th><th scope="col">Distance (km)</th><th scope="col">Runs</th></tr>
        </thead>
        <tbody>
          {weeks.map((w) => (
            <tr key={w.weekStart}><td>{w.weekStart}</td><td>{formatKm(w.distanceKm)}</td><td>{w.runs}</td></tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
