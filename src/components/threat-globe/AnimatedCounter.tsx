import { useEffect, useState } from 'react';

function useCountUp(end: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
}

export default function AnimatedCounter({ value }: { value: number }) {
  const animatedValue = useCountUp(value);
  return <span>{animatedValue > 0 ? animatedValue.toLocaleString() : '-----'}</span>;
}
