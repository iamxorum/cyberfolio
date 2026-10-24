import { useSyncExternalStore } from 'react';
import { ACCENT_PRINT, getPrintAccent } from '@/lib/accent';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-accent'] });
  return () => observer.disconnect();
}

/** Print colour of the site's current accent; follows the picker live. */
export function usePrintAccent() {
  return useSyncExternalStore(subscribe, getPrintAccent, () => ACCENT_PRINT.default);
}
