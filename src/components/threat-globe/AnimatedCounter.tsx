import { useEffect, useState } from 'react';
import { usePrefersReducedMotion } from '@/lib/motion';

function useCountUp(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const reduceMotion = usePrefersReducedMotion();
  useEffect(() => {
    if (end === 0 || reduceMotion) return;
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
  }, [end, duration, reduceMotion]);
  return reduceMotion ? end : count;
}

export default function AnimatedCounter({ value }: { value: number }) {
  const animatedValue = useCountUp(value);
  return <span>{animatedValue > 0 ? animatedValue.toLocaleString() : '-----'}</span>;
}
