interface SelectableStyle {
  id: string;
  name: string;
  description: string;
  domain: string;
  icon: string;
}

interface StyleSelectorGridProps<T extends SelectableStyle> {
  styles: T[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function StyleSelectorGrid<T extends SelectableStyle>({ styles, selectedId, onSelect }: StyleSelectorGridProps<T>) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {styles.map((style) => {
        const isSelected = selectedId === style.id;
        return (
          <button
            key={style.id}
            onClick={() => onSelect(style.id)}
            className={`flex flex-col gap-2 p-4 rounded border transition-all active:scale-[0.98] cursor-pointer text-left ${isSelected
              ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.3)]'
              : 'border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] hover:border-primary/50 hover:bg-[var(--terminal-surface-hover)]'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded flex items-center justify-center ${isSelected ? 'bg-primary/20 text-primary' : 'bg-[var(--terminal-bg)] text-[var(--terminal-text-dim)]'
                }`}>
                <span className="material-symbols-outlined text-[24px] leading-none">{style.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className={`text-sm sm:text-base font-bold font-mono ${isSelected ? 'text-primary' : 'text-[var(--terminal-text)]'
                  }`}>
                  {style.name}
                </h2>
                <p className="text-[var(--terminal-text-dim)] text-xs font-mono mt-1">
                  {style.domain}
                </p>
              </div>
            </div>
            <p className="text-[var(--terminal-text-muted)] text-xs font-mono leading-relaxed">
              {style.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
