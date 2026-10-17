'use client';

import { useEffect, useRef, useState } from 'react';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { usePrefersReducedMotion } from '@/lib/motion';

const DURATION_MS = 1100;
const DIGITS = /\d+/g;
const HAS_DIGIT = /\d/;

/**
 * Counts every number in `value` up from 0 the first time the text holds digits and is on screen
 * ("42ms", "99.9%", "1440×900"). Later changes (a live viewport resize) render as-is.
 */
export default function CountUpText({ value }: { value: string }) {
  const [ref, inView] = useInViewOnce<HTMLSpanElement>();
  const reduceMotion = usePrefersReducedMotion();
  const played = useRef(false);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const numbers = value.match(DIGITS);
    if (!inView || played.current || reduceMotion || !numbers) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    let start: number | null = null;
    const step = (now: number) => {
      start ??= now;
      const progress = Math.min((now - start) / DURATION_MS, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      let i = 0;
      setDisplay(value.replace(DIGITS, () => String(Math.floor(Number(numbers[i++]) * ease))));
      if (progress < 1) frame = requestAnimationFrame(step);
      else played.current = true;
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [inView, reduceMotion, value]);

  // Until it scrolls into view, show zeros so the final number never flashes before counting up.
  const shown = inView || !HAS_DIGIT.test(value) ? display : value.replace(DIGITS, '0');
  return <span ref={ref}>{shown}</span>;
}
