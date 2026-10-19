# Analytics (Umami)

Self-hosted, cookie-free page stats. Runs from the main `docker-compose.yml`.

```
browser ─▶ iamxorum.ro/stats/script.js
        ─▶ iamxorum.ro/stats/api/send ─▶ portfolio ─▶ umami (internal)

you (VPN) ─▶ dashboard at UMAMI_BIND:UMAMI_PORT
```

Visitors only talk to your domain. The dashboard is never public.

## Turn it on

1. Secrets:
   ```bash
   cp .env.analytics.example .env.analytics
   # set POSTGRES_PASSWORD, the same password inside DATABASE_URL, and APP_SECRET
   ```
2. In `.env`:
   ```
   COMPOSE_PROFILES=analytics
   ANALYTICS_UPSTREAM=http://umami:3000
   UMAMI_BIND=10.80.0.30      # your internal IP
   UMAMI_PORT=3020
   ```
3. `docker compose up -d --build`
4. Open the dashboard. Login `admin` / `umami`. **Change the password now.**
5. Add website `iamxorum.ro`. Copy its ID.
6. `src/config/analytics.config.ts`: set `websiteId`.
7. `src/config/features.config.ts`: set `analytics: true`.
8. `docker compose up -d --build` again.
9. Visit the site. Check Realtime in the dashboard.

## Where the data lives

Umami keeps everything in its Postgres database. By default that is the Docker volume `analytics_umami-db`.
To keep it in a folder on the host instead (simple to back up or snapshot), set an absolute path in `.env`:

```
UMAMI_DATA=/srv/umami-db
```

The folder is created if missing and must be writable by the Postgres user (uid 70 in the alpine image):
`sudo mkdir -p /srv/umami-db && sudo chown 70:70 /srv/umami-db`.

A new folder starts with an empty database. To keep your existing stats, copy the volume across first:

```bash
docker compose stop umami umami-db
docker run --rm -v analytics_umami-db:/from -v /srv/umami-db:/to alpine cp -a /from/. /to/
# set UMAMI_DATA in .env, then
docker compose up -d
```

Remove `UMAMI_DATA` to go back to the Docker volume.

## Show view counts on the blog

Blog posts and the blog list can show how many times each post was read. In the dashboard, create a
**view-only** user (Settings > Users), then add to `.env`:

```
UMAMI_API_USER=blog-readonly
UMAMI_API_PASSWORD=...
```

Rebuild. Counts refresh at most every 10 minutes, and a post only shows its count from 10 views up
(`MIN_VIEWS_SHOWN` in `src/lib/umami.ts`). Without the login, or if Umami is down, no counts are shown.

## Turn it off

- Keep the site, drop Umami: remove `COMPOSE_PROFILES` from `.env`, then `docker compose up -d --remove-orphans`.
- Drop the tracker: set `analytics: false`.

Data stays in the `analytics_umami-db` volume until you delete it.

## Moving from the old `deploy/analytics` stack

Do this **before** pulling the new code:

```bash
cd deploy/analytics && docker compose down        # keeps the data volume
cd ../..
git pull
. deploy/analytics/.env
printf 'POSTGRES_PASSWORD=%s\nDATABASE_URL=postgresql://umami:%s@umami-db:5432/umami\nAPP_SECRET=%s\n' \
  "$POSTGRES_PASSWORD" "$POSTGRES_PASSWORD" "$APP_SECRET" > .env.analytics
```

Then follow steps 2, 3 and 8. Your website, users and stats are kept. If you already pulled, run `docker rm -f umami umami-db` first. The old `deploy/analytics/.env` can go after.

## What is tracked

- Page views, including in-app navigation.
- Skipped: Do Not Track, and any host except `iamxorum.ro` / `iamxorum.eu`.
- No cookies. Umami stores a hash, not the raw IP.

## Client IPs

Umami uses the IP the portfolio forwards. Set `RATE_LIMIT_PROXY` in `.env` to match what is in front of the site (e.g. `cloudflare`).

## Problems

| Symptom | Cause |
|---|---|
| `/stats/script.js` 404 | `analytics` is false, or `ANALYTICS_UPSTREAM` missing. Check `docker logs cyberfolio` for `[ANALYTICS]` |
| `/stats/script.js` 502 | Portfolio can't reach Umami. Is the `analytics` profile on? |
| Still failing after editing `.env` | `docker compose restart` ignores `.env`. Use `docker compose up -d --force-recreate` |
| Script loads, no visits | Wrong `websiteId`, Do Not Track, or an ad blocker |
| Event 403 | Origin isn't your domain |
| Event 429 | Over 120 events a minute from one IP |
| Cloudflare keeps an old error | Purge `/stats/script.js` |

Check Umami from the portfolio container:

```bash
docker exec cyberfolio wget -qO- http://umami:3000/script.js | head -c 100
```

## Safety

- The database has no published port and sits on a network the portfolio can't reach.
- Pin the Umami image version once it works.
- Back up the `analytics_umami-db` volume if the numbers matter.
