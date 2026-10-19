interface GlobeSpinToggleProps {
  isSpinning: boolean;
  onToggle: () => void;
}

export default function GlobeSpinToggle({ isSpinning, onToggle }: GlobeSpinToggleProps) {
  const label = isSpinning ? 'Stop auto-rotation' : 'Resume auto-rotation';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={!isSpinning}
      aria-label={label}
      title={label}
      className="absolute bottom-2 right-2 z-20 flex items-center gap-1.5 font-mono text-[9px] uppercase text-[var(--terminal-text)]/70 bg-[rgba(var(--terminal-bg-rgb),0.40)] px-2 py-1.5 rounded border border-[rgba(var(--terminal-text-rgb),0.5)] backdrop-blur-sm transition-[background-color,color] duration-150 ease-out active:scale-[0.97] hover:bg-[rgba(var(--terminal-text-rgb),0.08)] hover:text-primary"
    >
      <span className="material-symbols-outlined text-sm leading-none">{isSpinning ? 'pause' : 'play_arrow'}</span>
      {isSpinning ? 'Stop_Spin' : 'Play_Spin'}
    </button>
  );
}
