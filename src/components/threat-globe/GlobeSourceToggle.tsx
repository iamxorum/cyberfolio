interface VisibleSources {
  local: boolean;
  public: boolean;
}

interface GlobeSourceToggleProps {
  visibleSources: VisibleSources;
  onToggle: (source: keyof VisibleSources) => void;
}

export default function GlobeSourceToggle({ visibleSources, onToggle }: GlobeSourceToggleProps) {
  return (
    <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-1.5 font-mono text-[9px] bg-[rgba(var(--terminal-bg-rgb),0.40)] p-2 rounded border border-[rgba(var(--terminal-text-rgb),0.5)] backdrop-blur-sm">
      <button
        type="button"
        onClick={() => onToggle('local')}
        aria-pressed={visibleSources.local}
        title={visibleSources.local ? 'Hide local attacks' : 'Show local attacks'}
        className={`flex items-center gap-2 -m-0.5 p-0.5 rounded transition-[opacity,background-color] duration-150 ease-out active:scale-[0.97] hover:bg-[rgba(var(--terminal-text-rgb),0.08)] ${visibleSources.local ? 'opacity-100' : 'opacity-35'}`}
      >
        <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse shadow-[0_0_5px_#ef4444]"></div>
        <span className="text-[var(--terminal-text)]/70 uppercase">Local_Attack (Fail2Ban)</span>
      </button>
      <button
        type="button"
        onClick={() => onToggle('public')}
        aria-pressed={visibleSources.public}
        title={visibleSources.public ? 'Hide community blacklist' : 'Show community blacklist'}
        className={`flex items-center gap-2 -m-0.5 p-0.5 rounded transition-[opacity,background-color] duration-150 ease-out active:scale-[0.97] hover:bg-[rgba(var(--terminal-text-rgb),0.08)] ${visibleSources.public ? 'opacity-100' : 'opacity-35'}`}
      >
        <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_5px_#3b82f6]"></div>
        <span className="text-[var(--terminal-text)]/70 uppercase">Community_Blacklist (CAPI)</span>
      </button>
    </div>
  );
}
