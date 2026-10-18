import { useState, useEffect } from 'react';

/** `enabled` false skips every request and listener (the stat cards are switched off). */
export function useSystemStats(enabled = true) {
  const [uptime, setUptime] = useState<string>('--');
  const [responseTime, setResponseTime] = useState<string>('--');
  const [viewport, setViewport] = useState<string>('--');

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    // Cancels in-flight requests on unmount (and on the dev double-mount) so a late
    // response can't set state on a gone component.
    const controller = new AbortController();

    // Fetch uptime. A stale response (effect cancelled, or `enabled` flipped) is ignored via the signal.
    fetch('/api/uptime', { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Uptime request failed: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) setUptime(data.uptime || '--');
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        const sessionStart = sessionStorage.getItem('session_start_time');
        if (sessionStart) {
          const diff = Date.now() - parseInt(sessionStart);
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setUptime(`${hours}h ${minutes}m`);
        } else {
          sessionStorage.setItem('session_start_time', Date.now().toString());
          setUptime('0h 0m');
        }
      });

    // Fetch response time
    const startTime = performance.now();
    fetch('/api/response-time', { cache: 'no-store', signal: controller.signal })
      .then(() => {
        if (!controller.signal.aborted) setResponseTime(`${Math.round(performance.now() - startTime)}ms`);
      })
      .catch(() => {
        if (!controller.signal.aborted) setResponseTime('--');
      });

    // Update viewport
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport(`${width}×${height}`);
    };
    updateViewport();

    window.addEventListener('resize', updateViewport);
    return () => {
      controller.abort();
      window.removeEventListener('resize', updateViewport);
    };
  }, [enabled]);

  return { uptime, responseTime, viewport };
}
