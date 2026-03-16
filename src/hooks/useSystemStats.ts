import { useState, useEffect } from 'react';

export function useSystemStats() {
  const [uptime, setUptime] = useState<string>('--');
  const [responseTime, setResponseTime] = useState<string>('--');
  const [viewport, setViewport] = useState<string>('--');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Fetch uptime
    const fetchUptime = async () => {
      try {
        const response = await fetch('/api/uptime');
        const data = await response.json();
        setUptime(data.uptime || '--');
      } catch {
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
      }
    };
    fetchUptime();

    // Fetch response time
    const fetchResponseTime = async () => {
      try {
        const startTime = performance.now();
        await fetch('/api/response-time', { cache: 'no-store' });
        const endTime = performance.now();
        const measuredTime = Math.round(endTime - startTime);
        setResponseTime(`${measuredTime}ms`);
      } catch {
        setResponseTime('--');
      }
    };
    fetchResponseTime();

    // Update viewport
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport(`${width}×${height}`);
    };
    updateViewport();

    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return { uptime, responseTime, viewport };
}
