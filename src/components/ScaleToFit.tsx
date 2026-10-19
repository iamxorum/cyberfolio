'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScaleToFitProps {
  children: ReactNode;
}

/** Shows a fixed-width page at its true layout, scaled down to fit narrow screens. */
export default function ScaleToFit({ children }: ScaleToFitProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [naturalHeight, setNaturalHeight] = useState(0);

  useEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const recalc = () => {
      const containerWidth = outer.clientWidth;
      const contentWidth = inner.scrollWidth;
      if (containerWidth === 0 || contentWidth === 0) return;

      setScale(Math.min(1, containerWidth / contentWidth));
      setNaturalHeight(inner.scrollHeight);
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="scale-to-fit" style={{ height: naturalHeight ? naturalHeight * scale : undefined, overflow: 'hidden' }}>
      <div ref={innerRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 'fit-content', margin: '0 auto' }}>
        {children}
      </div>
    </div>
  );
}
