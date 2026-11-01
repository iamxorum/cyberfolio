# Threat feed

The home page globe reads one file: `public/data/banned_ips.json`. You produce it; the site only displays it.
`npm run setup` copies a sample (`public/data/banned_ips.example.json`) so the globe works on a fresh clone.

To turn the globe off, set `threatGlobe: false` in `features.config.ts`.

## Format

```json
{
  "last_updated": "2026-01-01T00:00:00+00:00",
  "total_banned": 2,
  "recent_bans": [
    { "ip": "198.51.100.xxx", "source": "public", "country": "DE", "city": "Frankfurt", "lat": 50.11, "lng": 8.68 },
    { "ip": "203.0.113.xxx", "source": "local", "country": "SG", "city": "Singapore", "lat": 1.35, "lng": 103.82 }
  ]
}
```

| Field | Meaning |
|---|---|
| `last_updated` | ISO 8601 time of the last refresh. The page shows "Last synced" and warns when it is older than 48 hours |
| `total_banned` | Number shown on the counter card. Usually `recent_bans.length`, but it can be a larger real total |
| `recent_bans[].ip` | Shown in the detail panel. Mask the last octet (`203.0.113.xxx`) so no full address is published |
| `recent_bans[].source` | `local` for bans from your own firewall (red), `public` for community blocklists (blue) |
| `recent_bans[].country` | ISO 3166-1 alpha-2 code |
| `recent_bans[].city` | Optional |
| `recent_bans[].lat`, `lng` | Position of the dot |

The arcs end at the nodes you list in `dc.config.ts`.

## Producing the file

Any script that writes this JSON works. A typical setup runs on the firewall host on a schedule:

1. List the banned addresses (for example from `ipset list` or the Fail2Ban and CrowdSec CLIs).
2. Look up each address in a GeoIP database such as MaxMind GeoLite2 City.
3. Mask the last octet and write the JSON.
4. Copy it to the web server, into the folder `docker-compose.yml` mounts as `./public`.

The file is read in the browser on each page load, so a new copy appears without a rebuild or restart.

## Privacy

The feed is public. Publish only what you are happy to show: masked addresses, and a city rather than exact coordinates if you prefer.
