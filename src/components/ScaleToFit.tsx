'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ScaleToFitProps {
  children: ReactNode;
}

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
      const contentHeight = inner.scrollHeight;
      if (containerWidth === 0 || contentWidth === 0) return;

      setScale(contentWidth > containerWidth ? containerWidth / contentWidth : 1);
      setNaturalHeight(contentHeight);
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={outerRef} className="scale-to-fit" style={{ height: naturalHeight ? naturalHeight * scale : undefined, overflow: 'hidden' }}>
      <div ref={innerRef} style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: 'fit-content' }}>
        {children}
      </div>
    </div>
  );
}
