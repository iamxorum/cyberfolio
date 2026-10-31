// Server-only Strava client. Credentials never reach the browser: the page renders
// from this module's in-memory cache (24h max). The slow personal-best scan always runs
// in the background so a visitor never waits on it. The cache is mirrored to disk so a
// restart within the 24h window serves the snapshot instead of re-fetching from Strava.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API = 'https://www.strava.com/api/v3';
const RUN_TYPES = new Set(['Run', 'TrailRun', 'VirtualRun']);
// Hard expiry: after 24h a snapshot is discarded and refetched, never served stale.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
// After a failed refresh (Strava down, rate-limited) nobody retries for this long, so visitors can't trigger a call storm.
const RETRY_AFTER_FAILURE_MS = 15 * 60 * 1000;
// Heatmap columns: the current week plus the 52 before it.
const HEAT_WEEKS = 53;
const MAX_YEAR_PAGES = 4;
// Completed weeks that make up the "average week".
const AVG_WEEKS = 12;
const RECENT_COUNT = 6;
// Routes are trimmed this far from both ends so a public trace never points at the front door.
const ROUTE_TRIM_M = 300;
const ROUTE_MIN_M = 1500;
const ROUTE_MAX_POINTS = 120;
const MAX_HISTORY_PAGES = 10;
const MAX_DETAIL_CALLS = 25;
const BEST_EFFORTS = ['5K', '10K', 'Half-Marathon', 'Marathon'] as const;
// .next/cache is writable by the runtime user in the Docker image (the app root is not).
const CACHE_FILE = process.env.STRAVA_CACHE_FILE || path.join(process.cwd(), '.next', 'cache', 'strava.json');
const EFFORT_METERS: Record<(typeof BEST_EFFORTS)[number], number> = { '5K': 5000, '10K': 10000, 'Half-Marathon': 21097, Marathon: 42195 };

export interface RunTotals {
  count: number;
  distanceKm: number;
  movingTimeSec: number;
  elevationM: number;
}

export interface RecentRun {
  id: number;
  name: string;
  date: string;
  distanceKm: number;
  movingTimeSec: number;
  elevationM: number;
  /** The trimmed shape of the route in a 0-100 box, with no coordinates. Null when too short or unmapped. */
  route: RoutePath | null;
}

export interface RoutePath {
  d: string;
  /** Where the visible trace begins and ends (the real start and end are trimmed off). */
  start: [number, number];
  end: [number, number];
}

export interface RunDay {
  date: string;
  distanceKm: number;
  runs: number;
}

export interface PersonalBest {
  effort: (typeof BEST_EFFORTS)[number];
  timeSec: number;
  date: string;
  activityId: number;
  distanceKm: number;
}

export interface PersonalBestView extends PersonalBest {
  daysAgo: number;
}

export interface RunRecords {
  longestKm: number;
  longestDate: string;
  climbM: number;
  climbDate: string;
}

interface RunningSummary {
  ytd: RunTotals;
  allTime: RunTotals;
  recent: RecentRun[];
  /** Biggest single run and biggest single climb in the heatmap window. Null with no runs. */
  records: RunRecords | null;
  /** Only days with at least one run. */
  days: RunDay[];
  profileUrl: string;
  fetchedAt: string;
}

export interface WeekStats {
  thisKm: number;
  thisRuns: number;
  lastKm: number;
  /** Mean over the last AVG_WEEKS completed weeks (this week excluded, rest weeks included). */
  avgKm: number;
  avgRuns: number;
  /** How many weeks the averages cover: AVG_WEEKS, or fewer on a young account. */
  avgWeeks: number;
  bestKm: number;
  /** Monday of the biggest week in the window. */
  bestStart: string;
}

export interface RunningData extends Omit<RunningSummary, 'days'> {
  /** Every day from the first Monday of the heatmap window through today, zero days included. */
  heat: RunDay[];
  /** Consecutive Monday-to-Sunday weeks with a run, ending this week (or last, if this week has no run yet). */
  weekStreak: number;
  /** Longest run of consecutive active weeks in the heatmap window. */
  bestWeekStreak: number;
  weeks: WeekStats;
  activeDays: number;
  bests: PersonalBestView[] | null;
}

interface StravaTotals {
  count: number;
  distance: number;
  moving_time: number;
  elevation_gain: number;
}

interface StravaSummaryActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  total_elevation_gain: number;
  sport_type?: string;
  type: string;
  start_date_local: string;
  map?: { summary_polyline?: string | null };
  private?: boolean;
  visibility?: string;
}

interface StravaBestEffort {
  name: string;
  elapsed_time: number;
  pr_rank: number | null;
}

interface Cached<T> {
  value: T;
  expiresAt: number;
}

let token: { accessToken: string; refreshToken: string; expiresAt: number } | null = null;
let athleteId: number | null = null;
let summaryCache: Cached<RunningSummary> | null = null;
let bestsCache: Cached<PersonalBest[]> | null = null;
let summaryInFlight: Promise<RunningSummary | null> | null = null;
let bestsInFlight: Promise<PersonalBest[] | null> | null = null;
let summaryRetryAt = 0;
let bestsRetryAt = 0;
let diskLoad: Promise<void> | null = null;

const isConfigured = () =>
  Boolean(process.env.STRAVA_CLIENT_ID && process.env.STRAVA_CLIENT_SECRET && process.env.STRAVA_REFRESH_TOKEN);

async function getAccessToken(): Promise<string> {
  if (token && token.expiresAt - 60_000 > Date.now()) return token.accessToken;

  const res = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      grant_type: 'refresh_token',
      // Strava may rotate the refresh token; keep using the newest one for this process.
      refresh_token: token?.refreshToken ?? process.env.STRAVA_REFRESH_TOKEN!,
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Strava token refresh failed: ${res.status}`);

  const data: { access_token: string; refresh_token: string; expires_at: number } = await res.json();
  token = { accessToken: data.access_token, refreshToken: data.refresh_token, expiresAt: data.expires_at * 1000 };
  return token.accessToken;
}

async function stravaGet<T>(path: string): Promise<T> {
  const accessToken = await getAccessToken();
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Strava ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function getAthleteId(): Promise<number> {
  if (athleteId) return athleteId;
  const envId = Number(process.env.STRAVA_ATHLETE_ID);
  athleteId = envId > 0 ? envId : (await stravaGet<{ id: number }>('/athlete')).id;
  return athleteId;
}

// Public runs only: private/"only me" activities stay off the portfolio even if the token can read them.
const isPublicRun = (a: StravaSummaryActivity) =>
  RUN_TYPES.has(a.sport_type ?? a.type) && !a.private && a.visibility !== 'only_me';

const toTotals = (t: StravaTotals): RunTotals => ({
  count: t.count,
  distanceKm: t.distance / 1000,
  movingTimeSec: t.moving_time,
  elevationM: t.elevation_gain,
});

// start_date_local is local wall-clock time with a misleading "Z"; treat it as UTC to keep the runner's own calendar.
const localDay = (iso: string) => iso.slice(0, 10);

const mondayOf = (day: Date) => {
  const d = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d;
};

const heatStart = () => {
  const start = mondayOf(new Date());
  start.setUTCDate(start.getUTCDate() - (HEAT_WEEKS - 1) * 7);
  return start;
};

function bucketDays(runs: StravaSummaryActivity[]): RunDay[] {
  const byDay = new Map<string, RunDay>();
  for (const run of runs) {
    const date = localDay(run.start_date_local);
    const day = byDay.get(date) ?? { date, distanceKm: 0, runs: 0 };
    day.distanceKm += run.distance / 1000;
    day.runs += 1;
    byDay.set(date, day);
  }
  return [...byDay.values()];
}

function buildHeat(days: RunDay[]) {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const today = new Date();
  const heat: RunDay[] = [];
  for (const d = heatStart(); d.getTime() <= today.getTime(); d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10);
    heat.push(byDate.get(date) ?? { date, distanceKm: 0, runs: 0 });
  }

  // The heatmap starts on a Monday, so every 7 entries is one calendar week and the last chunk is this week.
  const weeks = Array.from({ length: Math.ceil(heat.length / 7) }, (_, i) => heat.slice(i * 7, i * 7 + 7));
  const ran = (week: RunDay[]) => week.some((d) => d.runs > 0);
  let weekStreak = 0;
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (ran(weeks[i])) weekStreak++;
    else if (i !== weeks.length - 1) break;
  }
  let bestWeekStreak = 0;
  for (let i = 0, run = 0; i < weeks.length; i++) {
    run = ran(weeks[i]) ? run + 1 : 0;
    bestWeekStreak = Math.max(bestWeekStreak, run);
  }

  const km = (week: RunDay[]) => week.reduce((sum, d) => sum + d.distanceKm, 0);
  const runCount = (week: RunDay[]) => week.reduce((sum, d) => sum + d.runs, 0);
  const completed = weeks.slice(0, -1);
  // A new runner's empty weeks before the first run would drag the average to nothing, so start counting there.
  const window = completed.slice(-AVG_WEEKS);
  const recent = window.slice(Math.max(0, window.findIndex(ran)));
  const recentActive = recent.some(ran) ? recent : [];
  const best = weeks.reduce((top, week) => (km(week) > km(top) ? week : top), weeks[0]);
  const thisWeek = weeks[weeks.length - 1];
  const weekStats: WeekStats = {
    thisKm: km(thisWeek),
    thisRuns: runCount(thisWeek),
    lastKm: completed.length ? km(completed[completed.length - 1]) : 0,
    avgKm: recentActive.length ? recentActive.reduce((sum, w) => sum + km(w), 0) / recentActive.length : 0,
    avgRuns: recentActive.length ? recentActive.reduce((sum, w) => sum + runCount(w), 0) / recentActive.length : 0,
    avgWeeks: recentActive.length,
    bestKm: km(best),
    bestStart: best[0].date,
  };
  return { heat, weekStreak, bestWeekStreak, weeks: weekStats, activeDays: days.length };
}

// Google's encoded polyline format: 5-decimal lat/lng deltas packed into base-64-ish chunks.
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;
  const next = () => {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };
  while (index < encoded.length) {
    lat += next();
    lng += next();
    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

// Turns a polyline into a bare SVG path: trimmed at both ends, projected flat, scaled into 0-100.
// Nothing that locates the run (coordinates, bounding box, scale) leaves the server.
function routePath(encoded?: string | null): RoutePath | null {
  if (!encoded) return null;
  const points = decodePolyline(encoded);
  if (points.length < 10) return null;

  const meanLat = points.reduce((sum, [lat]) => sum + lat, 0) / points.length;
  const kx = Math.cos((meanLat * Math.PI) / 180);
  const metres = points.map(([lat, lng]) => [lng * kx * 111_320, lat * 110_540] as const);

  const along = [0];
  for (let i = 1; i < metres.length; i++) {
    along.push(along[i - 1] + Math.hypot(metres[i][0] - metres[i - 1][0], metres[i][1] - metres[i - 1][1]));
  }
  const total = along[along.length - 1];
  if (total < ROUTE_MIN_M) return null;

  const kept = metres.filter((_, i) => along[i] >= ROUTE_TRIM_M && total - along[i] >= ROUTE_TRIM_M);
  if (kept.length < 5) return null;

  const stride = Math.ceil(kept.length / ROUTE_MAX_POINTS);
  const sampled = kept.filter((_, i) => i % stride === 0 || i === kept.length - 1);

  const xs = sampled.map(([x]) => x);
  const ys = sampled.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const span = Math.max(Math.max(...xs) - minX, Math.max(...ys) - minY);
  if (span <= 0) return null;

  const scale = 88 / span;
  const offsetX = (100 - (Math.max(...xs) - minX) * scale) / 2;
  const offsetY = (100 - (Math.max(...ys) - minY) * scale) / 2;
  const flat = sampled.map(([x, y]): [number, number] => [
    Math.round((offsetX + (x - minX) * scale) * 10) / 10,
    Math.round((100 - offsetY - (y - minY) * scale) * 10) / 10,
  ]);
  return {
    d: flat.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(''),
    start: flat[0],
    end: flat[flat.length - 1],
  };
}

// With `after`, Strava pages oldest-first, so every page of the window is read and re-sorted newest-first.
async function fetchYearRuns(): Promise<StravaSummaryActivity[]> {
  const after = Math.floor(heatStart().getTime() / 1000) - 86_400;
  const runs: StravaSummaryActivity[] = [];
  for (let page = 1; page <= MAX_YEAR_PAGES; page++) {
    const batch = await stravaGet<StravaSummaryActivity[]>(`/athlete/activities?after=${after}&per_page=200&page=${page}`);
    runs.push(...batch.filter(isPublicRun));
    if (batch.length < 200) break;
  }
  return runs.sort((a, b) => b.start_date_local.localeCompare(a.start_date_local));
}

async function fetchSummary(): Promise<RunningSummary> {
  const id = await getAthleteId();
  const [stats, runs] = await Promise.all([
    stravaGet<{ ytd_run_totals: StravaTotals; all_run_totals: StravaTotals }>(`/athletes/${id}/stats`),
    fetchYearRuns(),
  ]);

  const longest = runs.reduce<StravaSummaryActivity | null>((top, r) => (!top || r.distance > top.distance ? r : top), null);
  const climb = runs.reduce<StravaSummaryActivity | null>((top, r) => (!top || r.total_elevation_gain > top.total_elevation_gain ? r : top), null);

  return {
    ytd: toTotals(stats.ytd_run_totals),
    allTime: toTotals(stats.all_run_totals),
    recent: runs.slice(0, RECENT_COUNT).map((r) => ({
      id: r.id,
      name: r.name,
      date: localDay(r.start_date_local),
      distanceKm: r.distance / 1000,
      movingTimeSec: r.moving_time,
      elevationM: r.total_elevation_gain,
      route: routePath(r.map?.summary_polyline),
    })),
    records: longest && climb
      ? {
          longestKm: longest.distance / 1000,
          longestDate: localDay(longest.start_date_local),
          climbM: climb.total_elevation_gain,
          climbDate: localDay(climb.start_date_local),
        }
      : null,
    days: bucketDays(runs),
    profileUrl: `https://www.strava.com/athletes/${id}`,
    fetchedAt: new Date().toISOString(),
  };
}

// The newest activity holding pr_rank 1 for an effort is the current all-time PR,
// so walk runs newest-first and stop once every distance is resolved. Summary pr_count
// can't be used as a filter: Strava reports 0 even on runs holding best-effort PRs.
async function fetchBests(): Promise<PersonalBest[]> {
  const runs: StravaSummaryActivity[] = [];
  for (let page = 1; page <= MAX_HISTORY_PAGES; page++) {
    const batch = await stravaGet<StravaSummaryActivity[]>(`/athlete/activities?per_page=200&page=${page}`);
    runs.push(...batch.filter(isPublicRun));
    if (batch.length < 200) break;
  }

  // Sequential on purpose: each result decides whether the next call is needed, and Strava rate-limits requests.
  const found = new Map<string, PersonalBest>();
  let detailCalls = 0;
  for (const run of runs) {
    const missing = BEST_EFFORTS.filter((e) => !found.has(e));
    if (missing.length === 0 || detailCalls >= MAX_DETAIL_CALLS) break;
    // Skip runs too short to contain any distance still unresolved.
    if (run.distance < Math.min(...missing.map((e) => EFFORT_METERS[e]))) continue;
    detailCalls++;
    const detail = await stravaGet<{ best_efforts?: StravaBestEffort[] }>(`/activities/${run.id}`);
    for (const effort of detail.best_efforts ?? []) {
      const name = BEST_EFFORTS.find((e) => e === effort.name);
      if (!name || effort.pr_rank !== 1 || found.has(name)) continue;
      found.set(name, { effort: name, timeSec: effort.elapsed_time, date: localDay(run.start_date_local), activityId: run.id, distanceKm: EFFORT_METERS[name] / 1000 });
    }
  }
  return BEST_EFFORTS.flatMap((e) => found.get(e) ?? []);
}

function loadFromDisk() {
  diskLoad ??= readFile(/*turbopackIgnore: true*/ CACHE_FILE, 'utf8')
    .then((raw) => {
      const saved: { summary?: typeof summaryCache; bests?: typeof bestsCache } = JSON.parse(raw);
      // Snapshots from before the heatmap (no `days`) or with string routes are an old shape; drop them so the first load refetches.
      const fresh = saved.summary?.value?.days && saved.summary.value.records !== undefined && saved.summary.value.recent.every((r) => typeof r.route !== 'string');
      summaryCache ??= fresh && saved.summary ? saved.summary : null;
      bestsCache ??= saved.bests?.value?.every((b) => b.distanceKm) ? saved.bests : null;
    })
    .catch(() => {});
  return diskLoad;
}

async function saveToDisk() {
  try {
    await mkdir(path.dirname(CACHE_FILE), { recursive: true });
    await writeFile(CACHE_FILE, JSON.stringify({ summary: summaryCache, bests: bestsCache }));
  } catch (err) {
    console.error('Strava cache write failed:', err);
  }
}

function refreshSummary() {
  if (Date.now() < summaryRetryAt) return Promise.resolve(summaryCache?.value ?? null);
  summaryInFlight ??= fetchSummary()
    .then((value) => {
      summaryCache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
      void saveToDisk();
      return value;
    })
    .catch((err) => {
      console.error(err);
      summaryRetryAt = Date.now() + RETRY_AFTER_FAILURE_MS;
      return null;
    })
    .finally(() => {
      summaryInFlight = null;
    });
  return summaryInFlight;
}

function refreshBests() {
  if (Date.now() < bestsRetryAt) return Promise.resolve(bestsCache?.value ?? null);
  bestsInFlight ??= fetchBests()
    .then((value) => {
      bestsCache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
      void saveToDisk();
      return value;
    })
    .catch((err) => {
      console.error(err);
      bestsRetryAt = Date.now() + RETRY_AFTER_FAILURE_MS;
      return null;
    })
    .finally(() => {
      bestsInFlight = null;
    });
  return bestsInFlight;
}

export async function getRunningData(): Promise<RunningData | null> {
  if (!isConfigured()) return null;
  await loadFromDisk();

  // Expired entries stay in place until their replacement lands, so a refresh never blanks the page,
  // and a failed one (Strava down, rate-limited) keeps showing the last good data.
  const now = Date.now();
  if (!bestsCache || bestsCache.expiresAt <= now) void refreshBests();
  if (summaryCache && summaryCache.expiresAt <= now) void refreshSummary();
  const summary = summaryCache?.value ?? (await refreshSummary());

  if (!summary) return null;
  const { days, ...rest } = summary;
  const bests = bestsCache?.value.map((b) => ({ ...b, daysAgo: Math.max(0, Math.floor((Date.now() - Date.parse(`${b.date}T00:00:00Z`)) / 86_400_000)) })) ?? null;
  return { ...rest, ...buildHeat(days), bests };
}
