import type { RunRecords } from '@/lib/strava';
import { formatDay, formatKm } from '@/lib/running-format';
import { STAGGER_STEP_MS } from '@/lib/motion';
import Reveal from '@/components/Reveal';

interface Row {
  title: string;
  value: string;
  note?: string;
}

export default function RunRecordsPanel({
  records,
  bestWeekKm,
  bestWeekStreak,
  className,
}: {
  records: RunRecords;
  bestWeekKm: number;
  bestWeekStreak: number;
  className: string;
}) {
  const rows: Row[] = [
    { title: 'LONGEST RUN', value: `${formatKm(records.longestKm)} km`, note: formatDay(records.longestDate) },
    { title: 'BIGGEST WEEK', value: `${formatKm(bestWeekKm)} km` },
    { title: 'WEEK STREAK', value: `${bestWeekStreak} ${bestWeekStreak === 1 ? 'week' : 'weeks'}` },
    { title: 'BIGGEST CLIMB', value: `${Math.round(records.climbM)} m`, note: formatDay(records.climbDate) },
  ];

  return (
    <Reveal draw delay={STAGGER_STEP_MS * 3} className={`${className} flex flex-col gap-3`}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[10px] sm:text-xs tracking-widest text-[var(--terminal-text-dim)]">RECORDS</p>
        <p className="text-[10px] text-[var(--terminal-text-dim)]">last 52 weeks</p>
      </div>
      <dl className="flex flex-col">
        {rows.map((row) => (
          <div key={row.title} className="flex items-baseline justify-between gap-3 border-t border-[var(--terminal-border)] first:border-0 py-2 first:pt-0 last:pb-0">
            <dt className="text-[10px] tracking-widest text-[var(--terminal-text-dim)]">{row.title}</dt>
            <dd className="flex items-baseline gap-2 tabular-nums">
              {row.note && <span className="text-[10px] text-[var(--terminal-text-dim)]">{row.note}</span>}
              <span className="text-sm font-bold text-[var(--terminal-text)]">{row.value}</span>
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}
