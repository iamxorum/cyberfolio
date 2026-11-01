# Analytics (Umami)

Optional, self-hosted, cookie-free page statistics. Off by default. It runs from the main `docker-compose.yml` under the `analytics` profile.

```
browser ─▶ example.com/stats/script.js
        ─▶ example.com/stats/api/send ─▶ portfolio ─▶ umami (internal network)

you (VPN) ─▶ dashboard at UMAMI_BIND:UMAMI_PORT
```

Visitors only talk to your own domain, and the dashboard is never public. The portfolio relays events to Umami, so the tracker is not blocked as a third-party script, and the relay filters bots and limits request size and rate.

## Set it up

1. **Create the database secrets.**
   ```bash
   cp .env.analytics.example .env.analytics
   ```
   Set `POSTGRES_PASSWORD`, the same password inside `DATABASE_URL`, and `APP_SECRET` (`openssl rand -hex 32`).
2. **Enable the profile** in `.env`:
   ```
   COMPOSE_PROFILES=analytics
   ANALYTICS_UPSTREAM=http://umami:3000
   UMAMI_BIND=10.0.0.5        # an internal IP, never a public one
   UMAMI_PORT=3020
   ```
3. **Start it:** `docker compose up -d --build`
4. **Open the dashboard** at `UMAMI_BIND:UMAMI_PORT`. Log in with `admin` / `umami` and change the password immediately.
5. **Add your website** in the dashboard and copy its ID.
6. **Turn it on in the config.** In `src/config/analytics.config.ts` set `websiteId`, and in `src/config/features.config.ts` set `analytics: true`.
7. **Rebuild**, because config is compiled in: `docker compose up -d --build`
8. **Check it.** Visit the site, then open Realtime in the dashboard.

## Options

In `analytics.config.ts`:

| Option | Default | Effect |
|---|---|---|
| `websiteId` | `''` | The Umami website ID. Empty keeps analytics off |
| `events` | `true` | Custom events: PDF downloads, contact actions, project opens, social clicks, theme toggle |
| `blockBots` | `true` | Drops crawlers, headless browsers and uptime monitors in the proxy, before they reach Umami |
| `performance` | `true` | Core Web Vitals (TTFB, FCP, LCP, CLS, INP) in Umami's Performance tab |

## What is tracked

- Page views, including client-side navigation, plus the custom events above and uncaught JavaScript errors.
- Not tracked: visitors with Do Not Track, and any host other than `domain` and `alternateDomains` from `site.config.ts` (so `localhost` is ignored).
- No cookies. Umami stores a hash, not the raw IP address.

## Exclude your own visits

Open `https://your-domain/?notrack=1` once in a browser to stop counting that browser. Use `?notrack=0` to turn it back on.

## Blog view counts

Posts and the blog list can show how many times each post was read.

1. In the dashboard create a **view-only** user (Settings, then Users).
2. Add its login to `.env`:
   ```
   UMAMI_API_USER=blog-readonly
   UMAMI_API_PASSWORD=...
   ```
3. Recreate the container: `docker compose up -d --force-recreate portfolio`. No rebuild is needed.

Counts refresh at most every 10 minutes, and a post shows its count only from 10 views up (`MIN_VIEWS_SHOWN` in `src/lib/umami.ts`). Without the login, or while Umami is down, no counts are shown.

## Client IP addresses

Umami records the address the portfolio forwards. Set `RATE_LIMIT_PROXY` in `.env` to match what sits in front of the site (for example `cloudflare`), or every visitor looks like the proxy.

## Where the data lives

Umami keeps everything in Postgres. By default that is the Docker volume `analytics_umami-db`. To use a host folder instead (easy to back up), set an absolute path in `.env`:

```
UMAMI_DATA=/srv/umami-db
```

The folder must be writable by the Postgres user (uid 70 in the alpine image):
`sudo mkdir -p /srv/umami-db && sudo chown 70:70 /srv/umami-db`

A new folder starts empty. To keep existing stats, copy the volume across first:

```bash
docker compose stop umami umami-db
docker run --rm -v analytics_umami-db:/from -v /srv/umami-db:/to alpine cp -a /from/. /to/
# set UMAMI_DATA in .env, then
docker compose up -d
```

Remove `UMAMI_DATA` to go back to the Docker volume.

## Turn it off

- Keep the tracker code but stop Umami: remove `COMPOSE_PROFILES` from `.env`, then `docker compose up -d --remove-orphans`.
- Remove the tracker: set `analytics: false` and rebuild.

The data stays in the `analytics_umami-db` volume until you delete it.

## Troubleshooting

| Symptom | Cause |
|---|---|
| `/stats/script.js` returns 404 | `analytics` is false, or `ANALYTICS_UPSTREAM` is missing. Look for `[ANALYTICS]` in `docker logs cyberfolio` |
| `/stats/script.js` returns 502 | The portfolio cannot reach Umami. Check that the `analytics` profile is running |
| `.env` changes have no effect | `docker compose restart` ignores `.env`. Use `docker compose up -d --force-recreate` |
| Script loads but no visits appear | Wrong `websiteId`, Do Not Track, an ad blocker, or `?notrack=1` set in your browser |
| Events return 403 | The request origin is not your domain |
| Events return 429 | More than 120 events a minute from one address |
| Cloudflare keeps serving an old error | Purge `/stats/script.js` from its cache |

Check that the portfolio can reach Umami:

```bash
docker exec cyberfolio wget -qO- http://umami:3000/script.js | head -c 100
```

## Security notes

- The database has no published port and sits on an internal network the portfolio cannot reach.
- The dashboard binds to `127.0.0.1` unless you set `UMAMI_BIND`. Keep it on an internal address.
- `docker-compose.yml` uses the `postgresql-latest` Umami tag. Pin a specific version once it works for you.
- Back up the database volume if the numbers matter.
