import { hobbies } from '@/config';

export default function HobbiesSection() {
  return (
    <div id="hobbies" className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-4 sm:p-6 matrix-bg scroll-mt-20">
      <h2 className="text-[var(--terminal-text)] font-mono text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-lg sm:text-xl">favorite</span>
        <span className="text-sm sm:text-base">INTERESTS & HOBBIES</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {hobbies.map((hobby, index) => (
          <div key={index} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary/50 transition-colors group">
            {hobby.icon && (
              <span className="material-symbols-outlined text-primary text-lg sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                {hobby.icon}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-mono text-[var(--terminal-text)] font-bold mb-1 group-hover:text-primary transition-colors">
                {hobby.name}
              </h3>
              {hobby.description && (
                <p className="text-[10px] sm:text-xs font-mono text-[var(--terminal-text-muted)] leading-relaxed">
                  {hobby.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
