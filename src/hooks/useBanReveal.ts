import { useEffect, useMemo, useState } from 'react';
import { prefersReducedMotion } from '@/lib/motion';
import { revealedKey, type BannedIP } from '@/lib/threat-globe';

// Dots load in gradually (batches, not all 400+ at once) - both for a nicer reveal
// and to spread the three.js mesh-creation cost across frames instead of one spike.
export function useBanReveal(isGlobeReady: boolean, banPoints: BannedIP[]) {
  const [revealedBanCount, setRevealedBanCount] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRevealedBanCount(0);
    if (!isGlobeReady || banPoints.length === 0) return;

    if (prefersReducedMotion()) {
      setRevealedBanCount(banPoints.length);
      return;
    }

    const INTERVAL_MS = 100;
    const TOTAL_STEPS = 40; // ~4s total reveal, regardless of dataset size
    const BATCH_SIZE = Math.max(1, Math.ceil(banPoints.length / TOTAL_STEPS));
    const interval = setInterval(() => {
      setRevealedBanCount((count) => {
        const next = count + BATCH_SIZE;
        if (next >= banPoints.length) {
          clearInterval(interval);
          return banPoints.length;
        }
        return next;
      });
    }, INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isGlobeReady, banPoints]);

  const revealedBanPoints = useMemo(() => banPoints.slice(0, revealedBanCount), [banPoints, revealedBanCount]);
  const revealedKeySet = useMemo(() => new Set(revealedBanPoints.map(revealedKey)), [revealedBanPoints]);

  return { revealedBanPoints, revealedKeySet };
}
