import { features } from '@/config';

/**
 * On unless `features.changelog` is false. A config written before this flag existed has no such key,
 * so a missing one counts as on and an old src/config keeps building.
 */
export const changelogEnabled = !('changelog' in features) || Boolean(features.changelog);

export interface Release {
  /** `Unreleased` for work that has not been tagged yet. */
  version: string;
  /** ISO date, shown as written. */
  date: string;
  changes: string[];
}

// Newest first. Add a release here when the version is bumped.
export const releases: Release[] = [
  {
    version: '1.6.4',
    date: '2026-10-24',
    changes: [
      'Accent colour picker in the header with 10 presets (and a hidden one); the skills radar and globe follow it live',
      'Navbar fits at every width: the site name is no longer cut off',
      'Changelog page',
      'Ultrawide: the post or project preview slides in, Esc closes it, /projects?project= restores it after a reload, and a copy-link button shares it',
      'Images can no longer be dragged out of the page',
      'Privacy page listing browser storage and third parties',
      'Security: the analytics relay caps request bodies while streaming; Cross-Origin-Opener-Policy header; production source maps',
      'Accessibility 100: larger globe legend touch targets, undistorted flags, no redundant alt text',
      'Hero button stays readable on hover in light mode',
    ],
  },
  {
    version: '1.6.3',
    date: '2026-10-23',
    changes: [
      'security.txt, llms.txt and humans.txt',
      'Experience timeline on /about with bullets, collapse, durations and company logos',
      'New blog posts render on demand, so adding an MDX file needs no rebuild',
      'Heading order, 404 title and labelled Turnstile dialog; decorative icons hidden from screen readers',
    ],
  },
  {
    version: '1.6.0',
    date: '2026-10-19',
    changes: [
      'Ultrawide horizontal layout with list and detail panes',
      'Self-hosted Umami analytics with custom events, web vitals and bot filtering',
      'Steam gaming log on /life, globe spin button, deferred globe loading',
      'Server-side Turnstile gate, CV and cover letter downloads',
      'Blog reading progress, related posts and optional view counts',
    ],
  },
  { version: '1.5.9', date: '2026-10-17', changes: ['Strava running log and the /life page, plus a layout reorganisation and UI improvements'] },
  { version: '1.5.8', date: '2026-09-22', changes: ['UX polish, security hardening on the email button, sitemap fix and multi-domain support'] },
  { version: '1.5.7', date: '2026-09-10', changes: ['Blog', 'The /summary page was removed'] },
  { version: '1.5.6', date: '2026-08-26', changes: ['Skills radar fixes and CV improvements'] },
  { version: '1.5.5', date: '2026-08-23', changes: ['Canary token easter egg'] },
  { version: '1.5.4', date: '2026-08-22', changes: ['Cover letter section and fixed download files'] },
  { version: '1.5.3', date: '2026-08-22', changes: ['Threat globe performance improvements'] },
  { version: '1.5.2', date: '2026-08-21', changes: ['Dark and light mode improvements, contribution tracking and CV improvements'] },
  { version: '1.5', date: '2026-08-21', changes: ['Middleware renamed to proxy and an /about fix'] },
  { version: '1.4.9', date: '2026-08-21', changes: ['SEO and security hardening, crawlable Turnstile, an interactive threat globe'] },
  { version: '1.4.8', date: '2026-08-20', changes: ['Motion, accessibility and performance work, plus CV and ATS handling'] },
  { version: '1.4.7', date: '2026-07-26', changes: ['Thesis viewing fix, CI workflow and lint fixes'] },
  { version: '1.4.5', date: '2026-07-23', changes: ['Light mode and performance improvements; CV changes for ATS compliance'] },
  { version: '1.4.4', date: '2026-06-25', changes: ['Thesis view'] },
  { version: '1.4.2', date: '2026-03-20', changes: ['Local and public banned IPs are told apart on the globe'] },
  { version: '1.4.1', date: '2026-03-16', changes: ['Configurable CSP and security headers'] },
  { version: '1.4.0', date: '2026-03-16', changes: ['Cloudflare Turnstile on the bio and CV sections'] },
  { version: '1.3.1', date: '2026-03-16', changes: ['Threat globe'] },
  { version: '1.2.0', date: '2026-01-01', changes: ['CV builder'] },
  { version: '1.1.0', date: '2025-12-28', changes: ['New colour scheme'] },
  { version: '1.0.0', date: '2025-12-27', changes: ['First release'] },
];
