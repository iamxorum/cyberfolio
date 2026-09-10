export type CVTab = 'resume' | 'letter';

interface TabSwitcherProps {
  activeTab: CVTab;
  onChange: (tab: CVTab) => void;
}

export default function TabSwitcher({ activeTab, onChange }: TabSwitcherProps) {
  return (
    <div className="mb-6 flex gap-2 no-print">
      <button
        onClick={() => onChange('resume')}
        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded h-11 px-5 border font-mono text-sm font-bold transition-all cursor-pointer ${activeTab === 'resume'
          ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.3)]'
          : 'border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] text-[var(--terminal-text-muted)] hover:border-primary/50'
          }`}
      >
        <span className="material-symbols-outlined text-lg">description</span>
        RESUME
      </button>
      <button
        onClick={() => onChange('letter')}
        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded h-11 px-5 border font-mono text-sm font-bold transition-all cursor-pointer ${activeTab === 'letter'
          ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.3)]'
          : 'border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] text-[var(--terminal-text-muted)] hover:border-primary/50'
          }`}
      >
        <span className="material-symbols-outlined text-lg">mail</span>
        COVER LETTER
      </button>
    </div>
  );
}
