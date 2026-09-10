import { useEffect, useState } from 'react';
import type { ThreatData } from '@/lib/threat-globe';

export function useThreatFeed() {
  const [threatData, setThreatData] = useState<ThreatData | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    fetch('/data/banned_ips.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ThreatData | null) => {
        if (data) {
          setThreatData(data);
          setTimeout(() => setIsRendering(true), 400);
        }
      })
      .catch(() => setHasError(true));
  }, []);

  return { threatData, hasError, isRendering };
}
