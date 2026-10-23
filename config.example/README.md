# Configuration Guide

Everything in this folder is a template. Copy it to `src/config/` (gitignored — your real content never touches git) and fill it in with your own life.

```bash
mkdir -p src/config && cp -r config.example/. src/config/
cp .env.example .env   # contact details and secrets, see "Environment" below
```

That's it. Edit the files below, `npm run dev`, and the site rebuilds around your content.

## Quick reference

| File | Controls |
|---|---|
| `site.config.ts` | Domain, name, role, location, birth date (for the live age), socials, favicon, and the CSP/image allowlist domains. No email or phone: those are in `.env` |
| `security.config.ts` | Cloudflare Turnstile site key + widget theme (bot gate on `/cv` and the contact details) |
| `content.config.ts` | Hero text, about bio paragraphs, projects page copy |
| `projects.config.ts` | Every project card — name, tags, links, status, visibility, category |
| `skills.config.ts` | Skills with a level (`informational` … `expert`) and a category; the radar chart shows the top 6 by level |
| `education.config.ts` | Schools, degrees, dates |
| `certifications.config.ts` | Certs, issuers, credential links |
| `languages.config.ts` | Spoken languages + CEFR-style proficiency |
| `experience.config.ts` | Work history for the About page and CV |
| `hobbies.config.ts` | Interests shown on the About page |
| `features.config.ts` | On/off switches for every optional feature: the blog, /life, /cv, the world globe, stat cards, badges, Strava, Steam, discography, ⌘K palette, boot screen, Turnstile, smooth scroll, scroll rail, footer tagline, calm mode (no animations) and GitHub stats. Strava and Turnstile are off by default here because they need credentials |
| `analytics.config.ts` | The Umami website ID for self-hosted analytics (off until `features.analytics` is on) |
| `badges.config.ts` | External contributor/verification badges (optional, empty by default) |
| `music.config.ts` | Discography tracks (Spotify/SoundCloud/YouTube embeds) |
| `cv.config.ts` | CV styles — each is a role-targeted résumé variant with its own skill filter, summary and accent color |
| `cover-letter.config.ts` | Cover letter styles. A letter can be paired with a CV style (see below) |
| `dc.config.ts` | The infrastructure nodes ThreatGlobe arcs attacks toward |

## The fields worth explaining

**`projects.config.ts`** — `visibility: 'public' | 'private'` decides what actually renders anywhere (private stays entirely out of the bundle's visible output, useful for client work under NDA). `category` is cosmetic tagging (`production` / `thesis` / `personal` / `open-source` / `commercial` / `academic`).

**`skills.config.ts`** — each skill has a `level`, which maps to a score (`skillLevelRanges` in the same file). The radar chart always shows your top 6 by score, so a 7th skill at a higher level bumps something off the chart automatically.

**`cv.config.ts` vs `cover-letter.config.ts`** — each has its own styles, and a cover letter can exist with no CV style (a letter for "Data Analyst" with no matching CV).

The two are linked by `id`: a letter pairs with the CV style that has the same `id`, or with the one named in its `cvStyleId`. A CV style that has a paired letter gets a **CV + LETTER** button on `/cv`, which downloads one PDF (cover letter first, then the CV). A CV style with no letter doesn't show that button. Example: `devops` CV + `devops` letter gives the combined download, `mlops` CV with no letter doesn't. Both documents are real vector-text PDFs made with `@react-pdf/renderer`, not a print/screenshot hack.

**`site.config.ts`'s `security` block** — not the same thing as `security.config.ts`. This one is CSP/`next/image` allowlist domains (script/style/image/font/frame/connect sources); `security.config.ts` is just the Turnstile widget key. Two files, two very different jobs, easy to mix up.

**`dc.config.ts`** — if you're using ThreatGlobe (see root README), these are the real (or fictional, your call) server locations that banned-IP arcs animate toward. `mapCenter` is just where the globe opens facing.

## Environment (`.env`)

Secrets and contact details are never in the config files, because config is compiled into the page code.

| Variable | What for |
|---|---|
| `TURNSTILE_SECRET_KEY` | Server side of the Turnstile check. The matching public key is in `security.config.ts` |
| `CONTACT_EMAIL` | Shown (and printed on the CV) only after a visitor passes Turnstile |
| `CONTACT_PHONE` | Optional. Same, and printed on the downloaded CV |
| `SECURITY_CONTACT` | Optional. Public contact for `/.well-known/security.txt` (email or URL). Unset means the file is not served. Public by design, so use a dedicated address, not `CONTACT_EMAIL` |
| `STRAVA_*` | Only when `features.strava` is on |
| `STEAM_API_KEY`, `STEAM_ID` | Only when `features.steam` is on |
| `ANALYTICS_UPSTREAM`, `UMAMI_*`, `COMPOSE_PROFILES` | Only for analytics, see `docs/analytics.md` |
| `RATE_LIMIT_PROXY`, `RATE_LIMIT_PROXY_HOPS` | How far to trust client-IP headers behind a proxy |

When Turnstile is on, `/cv` and the contact details need a signed 24-hour cookie that `/api/verify` sets after a passed check. Without it `/cv` sends only a gate page, and `/api/contact` answers 401.

## Notes

- Dates in the CV-related configs (experience, education, certifications) are free text, shown as written ("Jan 2023"). Only `birthDate` is numeric, and its `month` is 1–12.
- Project status colors: `green` / `yellow` / `blue` / `orange` / `red`.
- Icons are [Material Symbols Outlined](https://fonts.google.com/icons) names (`code`, `work`, `timer`, ...).
- Color theme lives in `src/app/colors.css`, not in these configs — swap the whole hacker-green palette for anything else, just keep contrast sane (don't put light green on yellow).
- Everything here is imported through `src/config/index.ts`. If you add a new file, export it there too.
- Adding an icon name anywhere (components or config) means regenerating the icon font: `npm run icons`.
- Config changes need a dev-server restart (or rebuild in prod) to take effect — these are compiled in, not read at runtime.
