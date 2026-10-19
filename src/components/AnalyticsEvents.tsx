'use client';

import { useEffect } from 'react';
import { track } from '@/lib/track';

// Umami's own switch: with this key set the tracker sends nothing from this browser.
const OPT_OUT_KEY = 'umami.disabled';

/**
 * Page-wide analytics behaviour that belongs to no single component:
 * - visit `?notrack=1` once in a browser to stop counting your own visits (`?notrack=0` turns it back on);
 * - outbound link clicks, as one delegated listener instead of a handler per link.
 */
export default function AnalyticsEvents() {
  useEffect(() => {
    try {
      const flag = new URLSearchParams(window.location.search).get('notrack');
      if (flag === '1') localStorage.setItem(OPT_OUT_KEY, '1');
      else if (flag === '0') localStorage.removeItem(OPT_OUT_KEY);
    } catch {
      // Storage can be blocked; the visit is simply counted.
    }

    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!link) return;
      try {
        const url = new URL((link as HTMLAnchorElement).href, window.location.href);
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
        if (url.host === window.location.host) return;
        track('outbound_click', { host: url.host });
      } catch {
        // Not a parseable URL; nothing to report.
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
