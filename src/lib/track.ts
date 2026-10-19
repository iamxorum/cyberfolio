import { analyticsConfig } from '@/config';

type EventData = Record<string, string | number | boolean>;

interface UmamiTracker {
  track: (event: string, data?: EventData) => void;
}

/** Sends a custom Umami event. Does nothing when events are off or the tracker isn't loaded (opt-out, blocked, dev). */
export function track(event: string, data?: EventData) {
  if (!analyticsConfig.events || typeof window === 'undefined') return;
  (window as unknown as { umami?: UmamiTracker }).umami?.track(event, data);
}

/**
 * Props for any element or link: the page-wide listener in AnalyticsEvents fires the event on click, so no handler
 * (or client component) is needed. Deliberately not Umami's `data-umami-event`, which cancels a link's navigation
 * and reloads the page, breaking client-side routing.
 */
export function eventProps(event: string, data: EventData = {}): Record<string, string> {
  if (!analyticsConfig.events) return {};
  const props: Record<string, string> = { 'data-track': event };
  for (const [key, value] of Object.entries(data)) props[`data-track-${key}`] = String(value);
  return props;
}
