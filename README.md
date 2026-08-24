# Cyberfolio

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

Terminal/hacker-themed personal portfolio (Next.js 16, TypeScript, Tailwind CSS 4). Most sections aren't static filler — they're backed by real, live systems, not stock content pretending to be dynamic.

## What makes this different

- **ThreatGlobe** — a live 3D globe plotting IPs banned by the author's actual home-lab firewalls: local Fail2Ban bans (red) and CrowdSec community blocklist hits (blue), geolocated via GeoLite2 and arced toward the real infrastructure nodes. Not a demo widget — it's a dashboard of real firewall activity, refreshed from the actual edge.
- **CV / résumé generator** — config-driven, multi-style, ATS-compliant. Exports a real vector-text PDF via `@react-pdf/renderer` (not a print/screenshot hack), with content-driven pagination and proper document metadata.
- **Cover letter generator** — same PDF pipeline, independent style config from the CV.
- **Interactive terminal** — a real command interpreter (`help`, `ls`, `cat <project>`, `whoami`, `contact`, `certs`, ...) reading from the same config as the rest of the site, with input sanitization since it's free-text echoed back to the DOM.
- Skills radar, project showcase, music discography, and a private-route document viewer (streams large PDFs with range-request support instead of buffering the whole file).
- Cloudflare Turnstile bot protection with a shared cross-page verification pass.
- Dynamic CSP, built per-deploy from an allowlist config rather than hardcoded.
- One security easter egg somewhere in the shipped JS. Not documenting what or where — that's rather the point. If you find it, you *really* shouldn't have been looking there.

## Disclaimer

For those who want to criticize the application because of being AI slopped, yes, I used AI for help me improving in coding. Toxicity is not welcomed here.

## Stack

Next.js 16 (App Router, `output: standalone`) · React 19 · TypeScript · Tailwind CSS 4 · `react-globe.gl` / `three.js` · `@react-pdf/renderer` · Cloudflare Turnstile

## Getting started

```bash
npm install
cp -r config.example config   # add your own content — see config/README.md
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Configuration

All personal content lives in `config/*.config.ts` and is gitignored by design — `config.example/` is the public template that mirrors every real config file with placeholders, so this repo stays reusable without leaking anyone's real data. Full field-by-field guide: [`config.example/README.md`](./config.example/README.md).

## Project structure

- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — one component per site section
- `src/config/` — your real content (gitignored) / `config.example/` — the public template
- `public/` — static assets

## Build & deploy

```bash
npm run build
npm start
```

Docker: multi-stage `Dockerfile` → `output: standalone`, single `docker-compose.yml` service, runs as a non-root user in the final image.

## Contributing

Issues and PRs are welcome — bug fixes, new config fields, a cleaner take on a component, whatever. Since `src/config/` is gitignored, `npm run lint`/`npm run build` in CI run against `config.example/`, so make sure new features degrade gracefully with placeholder content, not just your own.

## Support

If this saved you the weekend it took to build, a coffee's appreciated but never expected:

<a href="https://buymeacoffee.com/iamxorum"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="41" width="174"></a>

## License

MIT - use and modify freely. If you build on this for your own portfolio, a mention/link back is appreciated.
