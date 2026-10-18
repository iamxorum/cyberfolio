# Configuration Guide

Everything in this folder is a template. Copy it to `config/` (gitignored — your real content never touches git) and fill it in with your own life.

```bash
cp -r config.example config
```

That's it. Edit the files below, `npm run dev`, and the site rebuilds around your content — nothing else in the codebase needs to change.

## Quick reference

| File | Controls |
|---|---|
| `site.config.ts` | Domain, name, role, location, birth date (age calc), socials, favicon, and the CSP/image allowlist domains |
| `security.config.ts` | Cloudflare Turnstile site key + widget theme (bot gate on `/about` and `/cv`) |
| `content.config.ts` | Hero text, about bio paragraphs, projects page copy |
| `projects.config.ts` | Every project card — name, tags, links, status, visibility, category |
| `skills.config.ts` | Skills + 0–100 scores for the radar chart (top 6 by score render) |
| `education.config.ts` | Schools, degrees, dates |
| `certifications.config.ts` | Certs, issuers, credential links |
| `languages.config.ts` | Spoken languages + CEFR-style proficiency |
| `experience.config.ts` | Work history for the About page and CV |
| `hobbies.config.ts` | Interests shown on the About page |
| `features.config.ts` | On/off switches for every optional feature: the blog, /life, /cv, the world globe, stat cards, badges, Strava, discography, ⌘K palette, boot screen, Turnstile, smooth scroll, scroll rail, footer tagline, calm mode (no animations) and GitHub stats. Strava and Turnstile are off by default here because they need credentials |
| `analytics.config.ts` | The Umami website ID for self-hosted analytics (off until `features.analytics` is on) |
| `badges.config.ts` | External contributor/verification badges (optional, empty by default) |
| `music.config.ts` | Discography tracks (Spotify/SoundCloud/YouTube embeds) |
| `cv.config.ts` | CV styles — each is a domain-targeted résumé variant with its own skill filter and accent color |
| `cover-letter.config.ts` | Cover letter styles — independent from CV styles, same PDF export pipeline |
| `dc.config.ts` | The infrastructure nodes ThreatGlobe arcs attacks toward |
| `scripts.config.ts` | Third-party `<script>` tags (analytics, etc.) — empty by default |

## The fields worth explaining

**`projects.config.ts`** — `visibility: 'public' | 'private'` decides what actually renders anywhere (private stays entirely out of the bundle's visible output, useful for client work under NDA). `category` is cosmetic tagging (`production` / `thesis` / `personal` / `open-source` / `commercial` / `academic`).

**`skills.config.ts`** — score is 0–100. The radar chart always shows your top 6 by score, so if you add a 7th skill scoring higher than an existing one, it bumps something off the chart automatically.

**`cv.config.ts` vs `cover-letter.config.ts`** — deliberately decoupled. A CV style and a cover letter style don't need matching `id`s or even matching `domain`s — you can have a cover letter for "Data Analyst" with no corresponding CV style. Both export real vector-text PDFs via `@react-pdf/renderer`, not a print/screenshot hack.

**`site.config.ts`'s `security` block** — not the same thing as `security.config.ts`. This one is CSP/`next/image` allowlist domains (script/style/image/font/frame/connect sources); `security.config.ts` is just the Turnstile widget key. Two files, two very different jobs, easy to mix up.

**`dc.config.ts`** — if you're using ThreatGlobe (see root README), these are the real (or fictional, your call) server locations that banned-IP arcs animate toward. `mapCenter` is just where the globe opens facing.

## Notes

- Dates in most configs use JS `Date` convention: month is 0-indexed (`0` = January).
- Project status colors: `green` / `yellow` / `blue` / `orange` / `red`.
- Icons are [Material Symbols Outlined](https://fonts.google.com/icons) names (`code`, `work`, `timer`, ...).
- Color theme lives in `src/app/colors.css`, not in these configs — swap the whole hacker-green palette for anything else, just keep contrast sane (don't put light green on yellow).
- Everything here is imported through `src/config/index.ts` — if you add a new file, barrel-export it there too.
- Config changes need a dev-server restart (or rebuild in prod) to take effect — these are compiled in, not read at runtime.
