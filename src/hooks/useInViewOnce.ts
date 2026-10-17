import { useCallback, useRef, useState } from 'react';
import { observeOnce } from '@/lib/motion';

/** Callback ref + flag that flips to true the first time the element scrolls into view. */
export function useInViewOnce<T extends HTMLElement>(rootMargin?: string) {
  const [inView, setInView] = useState(false);
  const cleanup = useRef<(() => void) | null>(null);

  const ref = useCallback((el: T | null) => {
    cleanup.current?.();
    cleanup.current = null;
    if (el) cleanup.current = observeOnce(el, () => setInView(true), rootMargin);
  }, [rootMargin]);

  return [ref, inView] as const;
}
