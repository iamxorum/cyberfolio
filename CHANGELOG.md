# Changelog

Generated from `src/lib/changelog.ts` by `npm run changelog`. Do not edit by hand.

## 1.7.4 (2026-11-01)

- App icons (home screen and web app) are now set in site.config.ts instead of fixed files
- Personal files live under public/assets, so the repository ships no personal content
- The container runs with a read-only filesystem and no extra capabilities
- Fixed local previews in Safari loading unstyled because the CSP upgraded localhost requests to https
- Each version tag now publishes a GitHub Release and a demo image
- CHANGELOG.md is generated from this changelog, and CI fails when the two differ
- Rewrote the README and restored the analytics guide. Added a contributing guide and a security policy

## 1.7.3 (2026-10-31)

- Blog, projects and life ease their content in again after the loading skeleton. The skip-the-fade swap from 1.7.1 is removed

## 1.7.2 (2026-10-31)

- Fixed /blog and /projects replaying their entrance animation a moment after the page appeared
- Content that replaces a loading skeleton is now settled for good after the first frame, so no animation can restart

## 1.7.1 (2026-10-31)

- Navigation: page transitions are shorter and overlap, so opening a page no longer waits half a second
- Navigation: /life, /blog and /projects show a loading skeleton straight away while the server renders
- Life: fixed the personal bests panel flashing on phones. It is no longer remounted on every refresh
- Life: personal bests load through a small /api/running-bests endpoint instead of refreshing the whole page every 4 seconds
- Life: content no longer fades in from blank when it replaces a loading skeleton
- Life: the strava --summary line eases in with the panels
- Life: the run heatmap no longer prints one month label over another, and its squares pop in one by one from left to right
- Headings now use the same slide-up entrance as the panels, in place of the blur and scale one

## 1.7.0 (2026-10-31)

- CV: roles at the same company are grouped under one company header
- CV: each role shows a short stack (up to about 10 items) instead of every tool, and same-issuer course badges collapse into one certification line
- CV: PDF text is no longer hyphenated mid-word, and ATS text is left-aligned
- CV: new Core stack row, and an Interests section split into Studying and Outside work (a full-width footer on the Designed variant)
- CV: the Designed variant uses a single skill chip style, larger text and a LIVE tag on projects with a website
- cv.config: per-style coreSkills, excludeProjects, projectDescriptions and projectUrls
- Cover letter rewritten to match the CV
- About: each role shows a one-line intro above its bullets
- Skills: trimmed from 89 to 71, with Fail2Ban, CrowdSec and other missing tools added. Levels are now beginner, working, proficient and advanced; ties on the radar are broken by featuredSkills
- Contribution stats use an optional GITHUB_TOKEN, which avoids GitHub search rate limits
- Config changes: experience uses intro and bullets instead of description, plainSummary is gone, skill levels are renamed, and cvSkills, cvHighlight and certification cvName are new. config.example is updated
- Removed unused helpers and the unused album field in music.config

## 1.6.9 (2026-10-31)

- Performance: the music player loads on click, so /life no longer loads the SoundCloud embed up front (performance 74 to 90, best practices 71 to 96)
- Accessibility: text is never smaller than 12px, and closing the image zoom no longer leaves a focus ring
- Storage: cookie and local storage keys use the cyberfolio_ prefix. Theme, accent, intro and access reset once
- Security: stricter CSP (no wildcard connect host, frame-ancestors added), private files are read once, response status is checked before parsing, and rate limiting and origin checks are tested
- Running data serves the last good result while it refreshes, and backs off for 15 minutes after a Strava failure
- Threat globe: shows a warning when the feed stops updating
- Internal: large components split up, native dialog for the human check, typecheck and tests in CI, dependency updates

## 1.6.8 (2026-10-26)

- Blog list: filter by category and tag, search, sort by date or views, shareable filter URLs, j/k and Enter to move through posts
- Blog posts: series box, TL;DR summary, updated date, tags that link to indexable /blog/tag pages, and ← → to step between posts
- Reading aids: progress bar, minutes left, back to top and a live "on this page" outline, also in the ultrawide side panel (with smooth scrolling and per-section reading time)
- Post content: tables and strikethrough, click-to-zoom images with captions and arrow-key browsing, [!NOTE]/[!WARNING] callouts, code blocks with file names and highlighted lines
- Posts print as clean black-on-white pages
- Fixes: repeated headings now get distinct anchors, long dates read as "Oct 22, 2026"

## 1.6.7 (2026-10-26)

- CV: new Designed variant next to the ATS one (dark header band, timeline, skills panel, optional round photo in the PDF)
- PDF downloads get plain names: Name_CV.pdf, Name_CV_Cover_Letter.pdf, Name_Cover_Letter.pdf
- cv.config: new photo setting; /api/cv-photo serves private/cv-photo.jpg behind the same gate as /cv

## 1.6.6 (2026-10-25)

- Cover letter and CV + letter PDFs can carry a signature, unlocked with a password checked on the server (the image never ships in the page)
- features.config: new signature and accentPicker switches
- Report endpoint for CSP violations is an absolute URL, which Safari requires

## 1.6.5 (2026-10-24)

- Security: the access cookie is bound to the browser it was issued to, signed with its own secret and uses the __Host- prefix
- Security: scripts run only with a per-request nonce (no more unsafe-inline), blocked content is reported to a log endpoint, and HSTS is ready for preload
- Theme and accent are saved as cookies, so the page loads already themed with no flash
- CV and cover letter take the site accent instead of a colour per style, with more room under the name
- Accent picker: hovering a swatch outlines it in its own colour

## 1.6.4 (2026-10-24)

- Accent colour picker in the header with 10 presets (and a hidden one); the skills radar and globe follow it live
- Navbar fits at every width: the site name is no longer cut off
- Changelog page
- Ultrawide: the post or project preview slides in, Esc closes it, /projects?project= restores it after a reload, and a copy-link button shares it
- Images can no longer be dragged out of the page
- Privacy page listing browser storage and third parties
- Security: the analytics relay caps request bodies while streaming; Cross-Origin-Opener-Policy header; production source maps
- Accessibility 100: larger globe legend touch targets, undistorted flags, no redundant alt text
- Hero button stays readable on hover in light mode

## 1.6.3 (2026-10-23)

- security.txt, llms.txt and humans.txt
- Experience timeline on /about with bullets, collapse, durations and company logos
- New blog posts render on demand, so adding an MDX file needs no rebuild
- Heading order, 404 title and labelled Turnstile dialog; decorative icons hidden from screen readers

## 1.6.0 (2026-10-19)

- Ultrawide horizontal layout with list and detail panes
- Self-hosted Umami analytics with custom events, web vitals and bot filtering
- Steam gaming log on /life, globe spin button, deferred globe loading
- Server-side Turnstile gate, CV and cover letter downloads
- Blog reading progress, related posts and optional view counts

## 1.5.9 (2026-10-17)

- Strava running log and the /life page, plus a layout reorganisation and UI improvements

## 1.5.8 (2026-09-22)

- UX polish, security hardening on the email button, sitemap fix and multi-domain support

## 1.5.7 (2026-09-10)

- Blog
- The /summary page was removed

## 1.5.6 (2026-08-26)

- Skills radar fixes and CV improvements

## 1.5.5 (2026-08-23)

- Canary token easter egg

## 1.5.4 (2026-08-22)

- Cover letter section and fixed download files

## 1.5.3 (2026-08-22)

- Threat globe performance improvements

## 1.5.2 (2026-08-21)

- Dark and light mode improvements, contribution tracking and CV improvements

## 1.5 (2026-08-21)

- Middleware renamed to proxy and an /about fix

## 1.4.9 (2026-08-21)

- SEO and security hardening, crawlable Turnstile, an interactive threat globe

## 1.4.8 (2026-08-20)

- Motion, accessibility and performance work, plus CV and ATS handling

## 1.4.7 (2026-07-26)

- Thesis viewing fix, CI workflow and lint fixes

## 1.4.5 (2026-07-23)

- Light mode and performance improvements; CV changes for ATS compliance

## 1.4.4 (2026-06-25)

- Thesis view

## 1.4.2 (2026-03-20)

- Local and public banned IPs are told apart on the globe

## 1.4.1 (2026-03-16)

- Configurable CSP and security headers

## 1.4.0 (2026-03-16)

- Cloudflare Turnstile on the bio and CV sections

## 1.3.1 (2026-03-16)

- Threat globe

## 1.2.0 (2026-01-01)

- CV builder

## 1.1.0 (2025-12-28)

- New colour scheme

## 1.0.0 (2025-12-27)

- First release
