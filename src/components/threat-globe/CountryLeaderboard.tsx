import Image from 'next/image';
import type { CountryLeaderboardEntry } from '@/lib/threat-globe';

function getRankColor(idx: number) {
  if (idx < 3) return 'bg-[#ef4444] shadow-[0_0_5px_#ef4444]';
  if (idx < 7) return 'bg-[#fbbf24]';
  return 'bg-[#22c55e]';
}

interface CountryLeaderboardProps {
  entries: CountryLeaderboardEntry[];
  selectedCountry: string | null;
  isGlobeReady: boolean;
  onSelect: (entry: CountryLeaderboardEntry) => void;
}

export default function CountryLeaderboard({ entries, selectedCountry, isGlobeReady, onSelect }: CountryLeaderboardProps) {
  return (
    <div className="text-sm border border-[var(--terminal-border)] rounded overflow-hidden bg-[rgba(var(--terminal-bg-rgb),0.40)] w-full">
      <div className="bg-[var(--terminal-surface-alt)] border-b border-[var(--terminal-border)] p-2 grid grid-cols-12 text-[10px] font-bold text-[var(--terminal-text-muted)] tracking-widest">
        <div className="col-span-2 text-center">RK</div>
        <div className="col-span-3">ORIGIN</div>
        <div className="col-span-3 text-right">COUNT</div>
        <div className="col-span-4 pl-4 text-center">THREAT</div>
      </div>

      <div className="p-1 flex flex-col gap-1 max-h-[220px] overflow-y-auto custom-scrollbar">
        {entries.map((item, idx) => (
          <button
            key={item.country}
            onClick={() => onSelect(item)}
            disabled={!isGlobeReady}
            title={`Fly the globe to ${item.country}`}
            className={`grid grid-cols-12 w-full text-left text-[10px] items-center p-1.5 rounded transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.98] group/row disabled:cursor-default ${
              selectedCountry === item.country
                ? 'bg-[rgba(var(--terminal-text-rgb),0.10)]'
                : 'hover:bg-[rgba(var(--terminal-text-rgb),0.05)]'
            }`}
          >
            <div className="col-span-2 text-center text-[var(--terminal-text-dim)]">[{String(idx + 1).padStart(2, '0')}]</div>
            <div className={`col-span-3 font-bold truncate flex items-center gap-1.5 ${selectedCountry === item.country ? 'text-[#ef4444]' : 'text-[var(--terminal-text)]'}`}>
              <Image
                src={`https://flagcdn.com/w20/${item.country.toLowerCase()}.png`}
                alt=""
                width={14}
                height={10}
                style={{ width: '14px', height: '10px' }}
                className="rounded-[1px] flex-shrink-0"
                unoptimized
              />
              {item.country}
            </div>
            <div className="col-span-3 text-right text-[var(--terminal-text-dim)] group-hover/row:text-[#ef4444] transition-colors">
              {item.count.toLocaleString()}
            </div>
            <div className="col-span-4 pl-3 flex items-center gap-2">
              <div className="h-1 w-full bg-[#111] rounded-full overflow-hidden border border-[#222]">
                <div
                  className={`h-full w-full origin-left transition-transform duration-700 ease-out ${getRankColor(idx)}`}
                  style={{ transform: `scaleX(${item.percentage / 100})` }}
                ></div>
              </div>
              <span className="text-[8px] text-[var(--terminal-text-muted)] w-6 text-right">{Math.ceil(item.percentage)}%</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
