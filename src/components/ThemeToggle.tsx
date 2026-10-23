'use client';

import { useSyncExternalStore } from 'react';
import { isLightTheme, setLightTheme } from '@/lib/theme';
import { track } from '@/lib/track';

// The theme lives on <html>'s class list (set pre-hydration by the layout script), so
// read it from there. The server snapshot is `false`, which keeps hydration consistent.
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  return () => observer.disconnect();
}

export default function ThemeToggle() {
  const isLight = useSyncExternalStore(
    subscribeToTheme,
    isLightTheme,
    () => false,
  );

  const toggleTheme = () => {
    setLightTheme(!isLight);
    track('theme_toggle', { to: isLight ? 'dark' : 'light' });
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      className={`flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] hover:text-primary hover:border-primary active:scale-95 transition flex-shrink-0`}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-base sm:text-lg">
        {isLight ? 'dark_mode' : 'light_mode'}
      </span>
    </button>
  );
}
