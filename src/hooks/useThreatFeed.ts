import { useEffect, useState } from 'react';
import type { ThreatData } from '@/lib/threat-globe';

export function useThreatFeed() {
  const [threatData, setThreatData] = useState<ThreatData | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch('/data/banned_ips.json', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ThreatData | null) => {
        if (data) setThreatData(data);
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') setHasError(true);
      });
    return () => controller.abort();
  }, []);

  // Give the globe a beat after the data lands before mounting the heavy canvas.
  useEffect(() => {
    if (!threatData) return;
    const timer = setTimeout(() => setIsRendering(true), 400);
    return () => clearTimeout(timer);
  }, [threatData]);

  return { threatData, hasError, isRendering };
}
