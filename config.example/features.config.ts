export interface FeaturesConfig {
  // Pages. Off = 404, and gone from nav, search and sitemap.
  /** /blog, posts, tag filter, RSS. */
  blog: boolean;
  /** /life. */
  life: boolean;
  /** /changelog, release history from src/lib/changelog.ts. */
  changelog: boolean;
  /** /cv and the GET_CV button. */
  cv: boolean;
  /** Cover letter tab on /cv. */
  coverLetter: boolean;
  /** Password-gated signature on the cover letter and CV + letter PDFs. Needs SIGNATURE_PASSWORD in .env and private/signature.png. Off = /api/signature 404. */
  signature: boolean;

  // Home
  /** World globe + live threat feed. */
  threatGlobe: boolean;
  /** Four stat cards. Off = /api/uptime and /api/response-time 404. */
  systemStats: boolean;
  /** Badge row under the hero (badges.config.ts). */
  badges: boolean;

  // /life
  /** Strava running log. Needs STRAVA_* in .env. */
  strava: boolean;
  /** Steam gaming log. Needs STEAM_* in .env and a public Steam profile. */
  steam: boolean;
  /** Music player (music.config.ts). */
  discography: boolean;

  // Site-wide
  /** Accent colour picker in the header. Off = the default accent only. */
  accentPicker: boolean;
  /** Ctrl/⌘ K search. */
  commandPalette: boolean;
  /** Boot screen on first visit. */
  bootScreen: boolean;
  /** Cloudflare Turnstile gate on /cv and the contact details. Needs keys. Off = /api/verify 404. */
  turnstile: boolean;
  /** Lenis smooth scrolling. */
  smoothScroll: boolean;
  /** Custom scroll rail. Off = native scrollbar. */
  scrollIndicator: boolean;
  /** Self-hosted Umami under /stats. Needs analytics.config.ts + ANALYTICS_UPSTREAM. See docs/analytics.md. */
  analytics: boolean;
  /** Typed line in the footer. */
  footerTagline: boolean;
  /** No animations for anyone. Content just appears. */
  calmMode: boolean;
  /** PR and review counts from the GitHub API. Off = no GitHub requests. */
  githubContributions: boolean;
}

export const features: FeaturesConfig = {
  blog: true,
  life: true,
  changelog: true,
  cv: true,
  coverLetter: true,
  signature: false,

  threatGlobe: true,
  systemStats: true,
  badges: true,

  strava: false,
  steam: false,
  discography: true,

  accentPicker: true,
  commandPalette: true,
  bootScreen: true,
  turnstile: false,
  smoothScroll: true,
  scrollIndicator: true,
  analytics: false,
  footerTagline: true,
  calmMode: false,
  githubContributions: true,
};
