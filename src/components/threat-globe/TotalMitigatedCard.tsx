import AnimatedCounter from './AnimatedCounter';

export default function TotalMitigatedCard({ totalBanned }: { totalBanned: number }) {
  return (
    <div className="bg-[var(--terminal-surface-alt)] border border-[var(--terminal-border)] rounded p-4 relative overflow-hidden">
      <p className="text-[10px] text-[var(--terminal-text-muted)] mb-1">TOTAL_MITIGATED_IPS</p>
      <p className="text-4xl font-bold text-[var(--terminal-text)] tracking-tighter">
        <AnimatedCounter value={totalBanned} />
      </p>
    </div>
  );
}
