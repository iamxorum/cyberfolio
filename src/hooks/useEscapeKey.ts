import { useEffect } from 'react';

/** Calls `onEscape` when Escape is pressed while `active`, unless something else (a dialog, a field) already took the key. */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.defaultPrevented) return;
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable], [role="dialog"]')) return;
      onEscape();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, onEscape]);
}
