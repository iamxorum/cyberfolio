'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLight(document.documentElement.classList.contains('light'));
  }, []);

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle('light', next);
    document.documentElement.classList.toggle('dark', !next);
    localStorage.setItem('theme', next ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] hover:text-primary hover:border-primary transition-colors flex-shrink-0"
    >
      <span className="material-symbols-outlined text-base sm:text-lg">
        {isLight ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
}
