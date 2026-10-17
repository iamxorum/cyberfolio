import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/motion';
import { useInViewOnce } from '@/hooks/useInViewOnce';

function useCountUp(end: number, active: boolean, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const reduceMotion = usePrefersReducedMotion();
  useEffect(() => {
    if (!active || end === 0 || reduceMotion) return;
    let startTimestamp: number | null = null;
    let frame = 0;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * end));
      if (progress < 1) frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [end, active, duration, reduceMotion]);
  return reduceMotion ? end : count;
}

export default function AnimatedCounter({ value }: { value: number }) {
  const [ref, inView] = useInViewOnce<HTMLSpanElement>();
  const animatedValue = useCountUp(value, inView);
  return <span ref={ref}>{animatedValue > 0 ? animatedValue.toLocaleString() : '-----'}</span>;
}
