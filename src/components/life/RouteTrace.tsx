import type { RoutePath } from '@/lib/strava';

/**
 * The shape of a run, drawn like a glowing trace. The real start and end are trimmed off for privacy,
 * so hollow rings mark where the trace was cut: an open line reads as deliberate, not as missing data.
 */
export default function RouteTrace({ route }: { route: RoutePath | null }) {
  if (!route) {
    return <div className="w-full h-full flex items-center justify-center text-[10px] tracking-widest text-[var(--terminal-text-dim)]" aria-hidden="true">NO_TRACE</div>;
  }
  const ring = { fill: 'var(--terminal-surface)', stroke: 'var(--primary)', strokeWidth: 0.9 };
  return (
    <svg viewBox="0 0 100 100" className="route-trace w-full h-full overflow-visible" aria-hidden="true">
      <path d={route.d} pathLength={1} fill="none" stroke="var(--primary)" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={route.start[0]} cy={route.start[1]} r={2.6} {...ring} />
      <circle cx={route.end[0]} cy={route.end[1]} r={2.6} {...ring} />
    </svg>
  );
}
