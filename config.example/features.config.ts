export interface FeaturesConfig {
  // --- Pages (off = the route 404s and it disappears from the nav, ⌘K search and sitemap) ---
  /** /blog: posts, tag filter, RSS feed and per-post social cards. */
  blog: boolean;
  /** /life: running log, hobbies and music. */
  life: boolean;
  /** /cv: CV and cover-letter PDF generator, plus the GET_CV button in the header. */
  cv: boolean;
  /** The cover-letter tab on /cv (the resume tab always stays). */
  coverLetter: boolean;

  // --- Home page ---
  /** The live threat feed with the 3D world globe. Off = the globe code and its data are never loaded. */
  threatGlobe: boolean;
  /** The four stat cards (uptime, session, viewport, response time). Off = the cards go and /api/uptime and /api/response-time return 404. */
  systemStats: boolean;
  /** The badge row under the hero. Which badges show is set in badges.config.ts. */
  badges: boolean;

  // --- /life ---
  /** Strava running log. Needs the STRAVA_* variables in .env; off = no section and no Strava request. */
  strava: boolean;
  /** The "Discography" music player section (tracks come from music.config.ts). */
  discography: boolean;

  // --- Site-wide extras ---
  /** ⌘K / Ctrl+K command palette, its header button and the 404 search button. */
  commandPalette: boolean;
  /** The terminal-style boot screen on a visitor's first visit of the day. */
  bootScreen: boolean;
  /** Cloudflare Turnstile bot check on /about and /cv. Needs the site key (security.config.ts) and TURNSTILE_SECRET_KEY. Off = no gate and /api/verify returns 404. */
  turnstile: boolean;
  /** Inertial (Lenis) wheel scrolling on desktop. Off = native scrolling. */
  smoothScroll: boolean;
  /** The custom scroll-progress rail on the right edge. Off = the browser's normal scrollbar comes back. */
  scrollIndicator: boolean;
  /** The typed one-liner in the footer. */
  footerTagline: boolean;
  /**
   * Calm mode: treats every visitor as asking for reduced motion. No scroll reveals, typing, count-ups,
   * decrypt or parallax effects, no globe arcs/rings, no smooth scrolling, no boot screen, and CSS
   * animations/transitions collapse to instant. Content simply appears. Independent of the OS setting.
   */
  calmMode: boolean;
  /** Merged-PR and review counts on contribution projects, fetched from the GitHub API. Off = no GitHub requests. */
  githubContributions: boolean;
}

export const features: FeaturesConfig = {
  blog: true,
  life: true,
  cv: true,
  coverLetter: true,

  threatGlobe: true,
  systemStats: true,
  badges: true,

  strava: false,
  discography: true,

  commandPalette: true,
  bootScreen: true,
  turnstile: false,
  smoothScroll: true,
  scrollIndicator: true,
  footerTagline: true,
  calmMode: false,
  githubContributions: true,
};
