import { useCallback, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

const PULL = 0.28;
const MAX_SHIFT_PX = 8;

/**
 * Callback ref: the element leans a few pixels toward the cursor while hovered, then settles back.
 * Mouse only (touch has no hover) and off for reduced motion. The element's own CSS transition
 * smooths the movement; the transform is written directly, so no React renders.
 */
export function useMagnetic<T extends HTMLElement>() {
  const cleanup = useRef<(() => void) | null>(null);

  return useCallback((el: T | null) => {
    cleanup.current?.();
    cleanup.current = null;
    if (!el || prefersReducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const clamp = (v: number) => Math.max(-MAX_SHIFT_PX, Math.min(MAX_SHIFT_PX, v));
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate3d(${clamp(dx * PULL)}px, ${clamp(dy * PULL)}px, 0)`;
    };
    const onLeave = () => {
      el.style.transform = '';
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    cleanup.current = () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.style.transform = '';
    };
  }, []);
}
