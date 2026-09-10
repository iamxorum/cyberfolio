interface ViewToggleButtonProps {
  visible: boolean;
  onToggle: () => void;
  label: string;
}

export default function ViewToggleButton({ visible, onToggle, label }: ViewToggleButtonProps) {
  return (
    <div className="mt-6 pt-4 border-t border-[var(--terminal-border)]">
      <button
        onClick={onToggle}
        aria-expanded={visible}
        className="w-full flex items-center justify-center gap-3 rounded h-12 px-6 bg-primary text-[var(--terminal-on-primary)] text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/80 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.3)] border border-transparent hover:border-[var(--terminal-hover-border)]"
      >
        <span className="material-symbols-outlined text-lg">
          {visible ? 'visibility_off' : 'visibility'}
        </span>
        <span className="font-mono text-sm md:text-base">
          {visible ? `HIDE ${label}` : `VIEW ${label}`}
        </span>
      </button>
    </div>
  );
}
