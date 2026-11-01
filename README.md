# Cyberfolio

[![CI](https://github.com/iamxorum/cyberfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/iamxorum/cyberfolio/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org)

A terminal-themed personal portfolio built with Next.js 16, TypeScript and Tailwind CSS 4. All content comes from typed config files and MDX posts, so the same code serves any person's site.

**Live demo: [iamxorum.ro](https://iamxorum.ro)**, the author's own site running this code.

## Features

- **Live threat globe.** A 3D globe of IPs banned by your firewalls (Fail2Ban and CrowdSec), geolocated and drawn toward your infrastructure nodes. It reads a JSON file you produce, with a sample included ([format](./docs/threat-feed.md)).
- **CV and cover letter generator.** Config-driven styles exported as vector-text PDFs with `@react-pdf/renderer`. A letter can be paired with a CV style and downloaded as one file.
- **Blog.** MDX posts with reading progress, related posts, tags, RSS and optional view counts from a self-hosted Umami.
- **Gated contact details.** Cloudflare Turnstile is verified on the server. A passed check sets a signed 24-hour cookie, and `/cv`, the email and the phone number are only served to visitors who hold that cookie.
- **Strict CSP.** A per-request nonce policy built from an allowlist in the site config.
- **Optional integrations.** Strava, Steam, GitHub contribution stats, a music player and analytics, each behind a feature flag.

## Stack

Next.js 16 (App Router, `output: standalone`), React 19, TypeScript, Tailwind CSS 4, `react-globe.gl` and `three`, `@react-pdf/renderer`, Cloudflare Turnstile.

## Getting started

Requires Node.js 24.

```bash
npm install
npm run setup
npm run dev
```

`npm run setup` copies the example config, blog posts, `.env` and a sample threat feed into place. It never overwrites an existing file.

Open [http://localhost:3000](http://localhost:3000).

## Configuration

Personal content lives in `src/config/*.config.ts`, which is gitignored. `config.example/` is the public template with placeholder values. Secrets and contact details go in `.env`, never in config, because config is compiled into the build.

The field-by-field guide and the environment variable table are in [`config.example/README.md`](./config.example/README.md). Analytics setup is in [`docs/analytics.md`](./docs/analytics.md), and the threat globe's data file is described in [`docs/threat-feed.md`](./docs/threat-feed.md).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm test` | Unit tests (Node test runner) |
| `npm run setup` | Copy the examples into place on a fresh clone |
| `npm run icons` | Rebuild the icon font after adding an icon name |
| `npm run check:og` | Check that every page has a loading social image |
| `npm run changelog` | Regenerate `CHANGELOG.md` from `src/lib/changelog.ts` |

## Project structure

```
src/app/         App Router pages and API routes
src/components/  UI, grouped by feature
src/lib/         Server and shared logic
src/hooks/       React hooks
src/config/      Your content (gitignored); template in config.example/
content/blog/    MDX posts (gitignored); examples in content.example/
private/         Files served only through gated routes (gitignored)
public/          textures/ and og-fonts/ ship with the repo; assets/ is yours
scripts/         Development helpers
tests/           Unit tests
docs/            Setup guides
```

Everything that belongs to you goes in `public/assets/` (gitignored): `icons/`, `logos/` and `blog/<post-slug>/` for post images. `public/data/` is written by your server.

## Deployment

```bash
docker compose up -d --build
```

The multi-stage `Dockerfile` builds a standalone Next.js server that runs as a non-root user. `docker-compose.yml` mounts `public/`, `private/` and `content/` read-only, so posts and images change without a rebuild. Config changes need a rebuild.

A demo image built from `config.example/` (placeholder content) is published to `ghcr.io/iamxorum/cyberfolio:demo` on each release. Your own config is compiled into the build, so build your own image for a real site.

## Contributing

Issues and pull requests are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

Report vulnerabilities privately, as described in [SECURITY.md](./SECURITY.md).

## AI assistance

Parts of this project were written with AI assistance and reviewed by the author.

## Support

<a href="https://buymeacoffee.com/iamxorum"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="41" width="174"></a>

## License

MIT. A mention or link back is appreciated if you build on this for your own portfolio.
