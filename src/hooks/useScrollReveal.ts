import { useCallback, useRef } from 'react';
import { observeOnce } from '@/lib/motion';

/**
 * Callback ref for a container: every `[data-reveal]` element inside it (or the container itself)
 * gets `.is-visible` the first time it scrolls into view. Pairs with `.scroll-reveal` / `.panel-draw`.
 * Class changes are written straight to the DOM, so scrolling never causes a React render.
 */
export function useScrollReveal<T extends HTMLElement>() {
  const cleanups = useRef<Array<() => void>>([]);

  return useCallback((el: T | null) => {
    cleanups.current.forEach((fn) => fn());
    cleanups.current = [];
    if (!el) return;

    const targets = Array.from(el.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (el.hasAttribute('data-reveal')) targets.unshift(el);
    cleanups.current = targets.map((t) => observeOnce(t, () => t.classList.add('is-visible')));
  }, []);
}
