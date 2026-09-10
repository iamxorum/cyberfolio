import { useLogTicker } from '@/hooks/useLogTicker';
import type { BannedIP } from '@/lib/threat-globe';

const BATCH_SIZE = 6;
const INTERVAL_MS = 2800;

interface LiveBanTickerProps {
  entries: BannedIP[];
}

export default function LiveBanTicker({ entries }: LiveBanTickerProps) {
  const { batch, tick } = useLogTicker(entries, BATCH_SIZE, INTERVAL_MS);

  if (batch.length === 0) return null;

  return (
    <div className="border border-[var(--terminal-border)] rounded bg-[rgba(var(--terminal-bg-rgb),0.40)] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--terminal-surface-alt)] border-b border-[var(--terminal-border)]">
        <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-[var(--terminal-text-dim)]">MITIGATED_HOSTS.log</span>
        <span className="text-[8px] sm:text-[9px] font-mono text-[var(--terminal-text-dim)]">{entries.length} tracked</span>
      </div>
      <div key={tick} className="flex flex-col font-mono text-[10px] sm:text-[11px]">
        {batch.map((ban, idx) => (
          <div
            key={`${ban.ip}-${idx}`}
            className="animate-reveal flex items-center gap-2 px-3 py-1 border-b border-[var(--terminal-border)]/40 last:border-b-0"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <span className={ban.source === 'local' ? 'text-[#ef4444]' : 'text-[#3b82f6]'}>●</span>
            <span className="text-[var(--terminal-text-dim)] uppercase">{ban.source === 'local' ? 'BAN' : 'BLOCK'}</span>
            <span className="text-[var(--terminal-text)] truncate">{ban.ip}</span>
            <span className="text-[var(--terminal-text-muted)] truncate ml-auto text-right">
              {ban.city ? `${ban.city}, ` : ''}{ban.country}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
