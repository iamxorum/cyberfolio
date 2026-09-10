import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

/** Rotates through `items` in fixed-size batches on an interval — used for a scrolling log feed. */
export function useLogTicker<T>(items: T[], batchSize: number, intervalMs: number) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOffset(0);
    if (items.length <= batchSize || prefersReducedMotion()) return;

    const interval = setInterval(() => {
      setOffset((prev) => (prev + batchSize) % items.length);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [items, batchSize, intervalMs]);

  if (items.length === 0) return { batch: [], tick: 0 };

  const batch: T[] = [];
  for (let i = 0; i < Math.min(batchSize, items.length); i++) {
    batch.push(items[(offset + i) % items.length]);
  }

  return { batch, tick: offset };
}
