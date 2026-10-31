'use client';

import { useLayoutEffect } from 'react';

const IN_FLOW = '.scroll-reveal, .scroll-reveal-fade, .animate-reveal';

/**
 * Rendered inside a loading skeleton. When the real content replaces it, this unmounts and the content that is already
 * on screen is shown straight away instead of fading in from nothing behind the skeleton it replaced.
 *
 * `<html data-swap>` holds the content visible for the swap's first paint only (see globals.css). One frame later every
 * on-screen entrance element gets `.reveal-settled`, which is permanent, so removing the flag cannot replay an animation.
 * Elements below the fold are left alone and still animate when scrolled to.
 * Content that arrives with the first HTML never mounts a skeleton, so it keeps its full entrance.
 */
export default function SkeletonSwap() {
  useLayoutEffect(() => () => {
    const root = document.documentElement;
    root.dataset.swap = '';
    requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>(IN_FLOW).forEach((el) => {
        const { top, bottom } = el.getBoundingClientRect();
        if (top >= innerHeight || bottom <= 0) return;
        el.classList.add('reveal-settled');
        if (!el.classList.contains('animate-reveal')) el.classList.add('is-visible');
      });
      requestAnimationFrame(() => delete root.dataset.swap);
    });
  }, []);
  return null;
}
