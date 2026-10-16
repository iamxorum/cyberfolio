'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

// Inertial wheel scrolling for desktop. Touch devices keep their native momentum scroll,
// and visitors who ask for reduced motion keep plain native scrolling.
export default function SmoothScroll() {
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reducedMotion.matches) return;

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.9,
      // Keep #anchor jumps clear of the sticky header and the About quick-nav bar.
      anchors: { offset: -128 },
    });

    let frame = requestAnimationFrame(function raf(time) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
