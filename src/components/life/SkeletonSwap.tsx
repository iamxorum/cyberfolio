'use client';

import { useEffect } from 'react';

const SWAP_MS = 1200;

/**
 * Rendered inside a loading skeleton. When the real content replaces it, this unmounts and flags `<html data-swap>`
 * for a moment, so the content's entrance fade is skipped (see globals.css) instead of blanking out after the skeleton.
 * Content that arrives with the first HTML never mounts a skeleton, so it keeps its full entrance.
 */
export default function SkeletonSwap() {
  useEffect(() => {
    const root = document.documentElement;
    let timer: ReturnType<typeof setTimeout> | undefined;
    return () => {
      root.dataset.swap = '';
      clearTimeout(timer);
      timer = setTimeout(() => delete root.dataset.swap, SWAP_MS);
    };
  }, []);
  return null;
}
