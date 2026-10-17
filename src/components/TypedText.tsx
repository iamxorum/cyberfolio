'use client';

import { useEffect, useState } from 'react';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { usePrefersReducedMotion } from '@/lib/motion';

const CHAR_MS = 38;
const CURSOR_LINGER_MS = 1600;

/**
 * Types `text` out once when it scrolls into view. The untyped remainder stays in the layout
 * (transparent) so nothing shifts, and assistive tech reads the full string from the start.
 */
export default function TypedText({ text }: { text: string }) {
  const [ref, inView] = useInViewOnce<HTMLSpanElement>();
  const reduceMotion = usePrefersReducedMotion();
  const [count, setCount] = useState(0);
  const [cursorDone, setCursorDone] = useState(false);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    let typed = 0;
    const interval = setInterval(() => {
      typed += 1;
      setCount(typed);
      if (typed >= text.length) clearInterval(interval);
    }, CHAR_MS);
    const hideTimer = setTimeout(() => setCursorDone(true), text.length * CHAR_MS + CURSOR_LINGER_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(hideTimer);
    };
  }, [inView, reduceMotion, text]);

  if (reduceMotion) return <span>{text}</span>;

  return (
    <span ref={ref}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, count)}
        {inView && !cursorDone && <span className="blinking-cursor text-primary" />}
        <span className="opacity-0">{text.slice(count)}</span>
      </span>
    </span>
  );
}
