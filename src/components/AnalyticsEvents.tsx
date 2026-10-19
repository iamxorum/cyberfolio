'use client';

import { useEffect } from 'react';
import { track } from '@/lib/track';

// Umami's own switch: with this key set the tracker sends nothing from this browser.
const OPT_OUT_KEY = 'umami.disabled';
const MAX_ERRORS_PER_LOAD = 5;

/**
 * Page-wide analytics behaviour that belongs to no single component:
 * - visit `?notrack=1` once in a browser to stop counting your own visits (`?notrack=0` turns it back on);
 * - clicks, as one delegated listener instead of a handler per element: anything tagged with eventProps(),
 *   mail and phone links, and links to other sites;
 * - uncaught JavaScript errors (`js_error`), a few per page load.
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
      if (!(event.target instanceof Element)) return;

      // Elements tagged with eventProps(): the name plus every data-track-* attribute.
      const tagged = event.target.closest<HTMLElement>('[data-track]');
      if (tagged) {
        const data: Record<string, string> = {};
        for (const [key, value] of Object.entries(tagged.dataset)) {
          if (key.startsWith('track') && key !== 'track' && value !== undefined) {
            data[key.charAt(5).toLowerCase() + key.slice(6)] = value;
          }
        }
        track(tagged.dataset.track!, data);
      }

      const link = event.target.closest<HTMLAnchorElement>('a[href]');
      if (!link) return;
      try {
        const url = new URL(link.href, window.location.href);
        // Mail and phone links anywhere on the site; links tagged with their own event are already counted.
        if (url.protocol === 'mailto:' || url.protocol === 'tel:') {
          if (!link.hasAttribute('data-track')) track(url.protocol === 'mailto:' ? 'mailto_click' : 'tel_click', { from: window.location.pathname });
          return;
        }
        if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
        if (url.host === window.location.host) return;
        track('outbound_click', { host: url.host, from: window.location.pathname });
      } catch {
        // Not a parseable URL; nothing to report.
      }
    };
    // Uncaught errors, deduplicated and capped per page load so a render loop can't flood the proxy's rate limit.
    const seenErrors = new Set<string>();
    const reportError = (kind: string, message: string) => {
      const key = `${kind}:${message}`;
      if (seenErrors.has(key) || seenErrors.size >= MAX_ERRORS_PER_LOAD) return;
      seenErrors.add(key);
      track('js_error', { kind, message: message.slice(0, 120), page: window.location.pathname });
    };
    const onError = (event: ErrorEvent) => reportError('error', event.message || 'unknown');
    const onRejection = (event: PromiseRejectionEvent) =>
      reportError('rejection', event.reason instanceof Error ? event.reason.message : String(event.reason ?? 'unknown'));

    document.addEventListener('click', onClick);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  return null;
}
