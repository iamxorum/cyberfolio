'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { whenBootDone } from '@/lib/motion';

interface LazyMountProps {
  children: ReactNode;
  fallback: ReactNode;
  rootMargin?: string;
  /** Warms heavy modules/assets in an idle slice once the boot screen is gone, regardless of scroll position. */
  prefetch?: () => void;
}

function whenIdle(cb: () => void, timeout: number): () => void {
  if (typeof requestIdleCallback === 'function') {
    const id = requestIdleCallback(cb, { timeout });
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(cb, 200);
  return () => clearTimeout(id);
}

/**
 * Mounts `children` once the container nears the viewport, the boot screen is gone, and the
 * browser is idle, so heavy chunks (e.g. the globe) never compete with first paint or the boot sequence.
 */
export default function LazyMount({ children, fallback, rootMargin = '400px', prefetch }: LazyMountProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let cancelBoot = () => {};
    let cancelIdle = () => {};
    const mount = () => {
      cancelIdle = whenIdle(() => setIsVisible(true), 1500);
    };

    // Parse/fetch heavy modules after boot, off the scroll path, so mounting later is only the WebGL setup.
    let cancelPrefetch = () => {};
    const cancelPrefetchBoot = prefetch
      ? whenBootDone(() => { cancelPrefetch = whenIdle(prefetch, 4000); })
      : () => {};

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        cancelBoot = whenBootDone(mount);
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelBoot();
      cancelIdle();
      cancelPrefetchBoot();
      cancelPrefetch();
    };
  }, [rootMargin, prefetch]);

  return <div ref={containerRef}>{isVisible ? children : fallback}</div>;
}
