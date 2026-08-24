'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyMountProps {
  children: ReactNode;
  fallback: ReactNode;
  rootMargin?: string;
}

export default function LazyMount({ children, fallback, rootMargin = '400px' }: LazyMountProps) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={containerRef}>{isVisible ? children : fallback}</div>;
}
