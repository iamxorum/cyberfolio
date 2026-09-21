import { useRef, useCallback, useEffect } from 'react';

/** Batches mousemove-driven `--spot-x`/`--spot-y` CSS var updates into one write per animation frame. */
export function useSpotlight<T extends HTMLElement>() {
  const rafRef = useRef<number | null>(null);
  const pendingRef = useRef<{ el: T; x: string; y: string } | null>(null);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<T>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    pendingRef.current = {
      el,
      x: `${((e.clientX - rect.left) / rect.width) * 100}%`,
      y: `${((e.clientY - rect.top) / rect.height) * 100}%`,
    };

    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const pending = pendingRef.current;
      if (!pending) return;
      pending.el.style.setProperty('--spot-x', pending.x);
      pending.el.style.setProperty('--spot-y', pending.y);
    });
  }, []);

  return handleMouseMove;
}
