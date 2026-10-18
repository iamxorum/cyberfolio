# Self-hosted analytics (Umami)

Cookie-free, privacy-friendly page analytics that never leave your own network.

## How it fits together

```
visitor's browser
   │  GET  https://iamxorum.ro/stats/script.js      (the tracker)
   │  POST https://iamxorum.ro/stats/api/send       (each page view / event)
   ▼
portfolio (Next.js)  ── relays only those two paths, with limits ──▶  Umami  http://10.80.0.30:3000
                                                                       (internal network only)
you, over the VPN ──▶ https://analytics.iamxorum.ro  ──────────────▶  Umami dashboard
```

- The browser only ever talks to your own domain, so there is no third-party host, no CSP change, and ad
  blockers that match "analytics." hostnames have nothing to match.
- Only two Umami paths are reachable from the internet, through the site, with an origin check, a body-size cap
  and a per-IP rate limit. The dashboard, login and API are not exposed.
- `analytics.iamxorum.ro` is for **you**: an *internal* DNS record pointing at `10.80.0.30`. Do not create a
  public record for it.

## Setup

1. **Run Umami** on the internal host:
   ```bash
   cd deploy/analytics
   cp .env.example .env        # then set POSTGRES_PASSWORD and APP_SECRET (openssl rand -hex 32)
   docker compose up -d
   ```
2. **Internal DNS:** add `analytics.iamxorum.ro  A  10.80.0.30` to your internal resolver (split-horizon / VPN DNS).
   For HTTPS on the internal name, put any reverse proxy (Caddy, nginx) in front of port 3000.
3. **First login:** open the dashboard and sign in with `admin` / `umami`, then **change the password immediately**.
4. **Add the website:** Settings > Websites > Add, domain `iamxorum.ro`. Copy its **Website ID**.
5. **Wire up the portfolio:**
   - `src/config/analytics.config.ts`: set `websiteId`.
   - `src/config/features.config.ts`: set `analytics: true`.
   - `.env` of the portfolio: `ANALYTICS_UPSTREAM=http://10.80.0.30:3000`
   - Rebuild and redeploy the portfolio. The container must be able to reach `10.80.0.30:3000`.
6. **Check it works:** `curl -I https://iamxorum.ro/stats/script.js` returns 200, then browse the site and watch
   the dashboard's *Realtime* view.

## What gets tracked

- Page views, including client-side navigation (the tracker follows route changes).
- Not tracked: visitors sending Do Not Track, and anything not on `iamxorum.ro` / `iamxorum.eu` (so local
  development never pollutes the numbers).
- No cookies are set. Umami stores a hash of IP + user agent, not the raw values. Whether that needs a notice on
  your site depends on your own legal position; this setup is built to need as little as possible.

## Client IPs

Umami uses the `X-Forwarded-For` the portfolio sends. The portfolio takes the address from the same place its rate
limiter does, so set `RATE_LIMIT_PROXY` in the portfolio's `.env` to match what sits in front of it (for example
`cloudflare`), otherwise every visitor may look like the proxy's address.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| `/stats/script.js` is 404 | `features.analytics` is false, or `ANALYTICS_UPSTREAM` is missing or not an http(s) URL |
| `/stats/script.js` is 502 | The portfolio container cannot reach `ANALYTICS_UPSTREAM` (routing, firewall, Umami down) |
| Script loads but no visits appear | Wrong `websiteId`, or you are browsing from a domain outside `data-domains` |
| Events return 403 | The request's Origin/Referer is not your domain (a proxy stripping headers) |
| Events return 429 | More than 120 events a minute from one address |

## Keeping it safe

- Pin the image to a specific version or digest once it works, and update it deliberately.
- Back up the `umami-db` volume if the numbers matter to you.
- The database has no published port and the dashboard is bound to the internal interface; keep it that way.
