import { useEffect, useState } from 'react';

export function useThemeSync() {
  const [atmosphereColor, setAtmosphereColor] = useState('#2650d7');
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const syncTheme = () => {
      const accentRgb = getComputedStyle(document.documentElement).getPropertyValue('--terminal-accent-rgb').trim();
      if (accentRgb) setAtmosphereColor(`rgb(${accentRgb})`);
      setIsLight(document.documentElement.classList.contains('light'));
    };
    syncTheme();

    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => themeObserver.disconnect();
  }, []);

  return { atmosphereColor, isLight };
}
