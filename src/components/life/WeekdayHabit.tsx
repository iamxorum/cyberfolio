import type { RunDay } from '@/lib/strava';
import { STAGGER_STEP_MS } from '@/lib/motion';
import Reveal from '@/components/Reveal';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const BAR_HEIGHT = 56;

/** Runs per weekday over the heatmap window. The window starts on a Monday, so a day's weekday is its index mod 7. */
export default function WeekdayHabit({ heat, className }: { heat: RunDay[]; className: string }) {
  const counts = DAYS.map((_, weekday) => heat.reduce((sum, d, i) => (i % 7 === weekday ? sum + d.runs : sum), 0));
  const max = Math.max(...counts);
  if (max === 0) return null;
  const favourite = counts.indexOf(max);

  return (
    <Reveal draw delay={STAGGER_STEP_MS * 2} className={`${className} flex flex-col gap-3`}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[10px] sm:text-xs tracking-widest text-[var(--terminal-text-dim)]">WEEKDAY HABIT</p>
        <p className="text-[10px] text-[var(--terminal-text-muted)]">mostly {DAYS[favourite]}s</p>
      </div>

      <div className="grid grid-cols-7 gap-1.5" aria-hidden="true">
        {counts.map((count, weekday) => (
          <div key={weekday} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] text-[var(--terminal-text-muted)] tabular-nums">{count}</span>
            <div className="w-full flex items-end" style={{ height: BAR_HEIGHT }}>
              <div
                className={`habit-bar w-full rounded-t-[3px] ${weekday === favourite ? 'bg-primary' : 'bg-primary/40'}`}
                style={{ height: count > 0 ? `max(${(count / max) * 100}%, 3px)` : 2, '--bar-delay': `${300 + weekday * 50}ms` } as React.CSSProperties}
              />
            </div>
            <span className="text-[10px] text-[var(--terminal-text-dim)]">{DAYS[weekday][0]}</span>
          </div>
        ))}
      </div>

      <ul className="sr-only">
        {counts.map((count, weekday) => (
          <li key={weekday}>{DAYS[weekday]}: {count} {count === 1 ? 'run' : 'runs'}</li>
        ))}
      </ul>
    </Reveal>
  );
}
