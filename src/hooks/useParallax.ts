import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

const MAX_SHIFT_PX = 80;

/**
 * Drifts a background layer slower than the page while its parent is on screen.
 * The layer must overhang its parent by MAX_SHIFT_PX top and bottom (e.g. `-inset-y-20`).
 */
export function useParallax<T extends HTMLElement>(speed = 0.12) {
  const layerRef = useRef<T>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const host = layer?.parentElement;
    if (!layer || !host || prefersReducedMotion()) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = host.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const shift = Math.max(-MAX_SHIFT_PX, Math.min(MAX_SHIFT_PX, -rect.top * speed));
      layer.style.transform = `translate3d(0, ${shift}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [speed]);

  return layerRef;
}
