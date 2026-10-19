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
const WEEKS = 12;
const RECENT_COUNT = 5;
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
}

export interface WeeklyDistance {
  weekStart: string;
  distanceKm: number;
  runs: number;
}

export interface PersonalBest {
  effort: (typeof BEST_EFFORTS)[number];
  timeSec: number;
  date: string;
  activityId: number;
}

export interface RunningData {
  ytd: RunTotals;
  allTime: RunTotals;
  recent: RecentRun[];
  weekly: WeeklyDistance[];
  bests: PersonalBest[] | null;
  profileUrl: string;
  fetchedAt: string;
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
let summaryCache: Cached<Omit<RunningData, 'bests'>> | null = null;
let bestsCache: Cached<PersonalBest[]> | null = null;
let summaryInFlight: Promise<Omit<RunningData, 'bests'> | null> | null = null;
let bestsInFlight: Promise<PersonalBest[] | null> | null = null;
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

function bucketWeeks(runs: StravaSummaryActivity[]): WeeklyDistance[] {
  const thisMonday = mondayOf(new Date());
  const weeks: WeeklyDistance[] = Array.from({ length: WEEKS }, (_, i) => {
    const start = new Date(thisMonday);
    start.setUTCDate(start.getUTCDate() - (WEEKS - 1 - i) * 7);
    return { weekStart: start.toISOString().slice(0, 10), distanceKm: 0, runs: 0 };
  });
  const byStart = new Map(weeks.map((w) => [w.weekStart, w]));

  for (const run of runs) {
    const week = byStart.get(mondayOf(new Date(`${localDay(run.start_date_local)}T00:00:00Z`)).toISOString().slice(0, 10));
    if (!week) continue;
    week.distanceKm += run.distance / 1000;
    week.runs += 1;
  }
  return weeks;
}

async function fetchSummary(): Promise<Omit<RunningData, 'bests'>> {
  const id = await getAthleteId();
  const [stats, activities] = await Promise.all([
    stravaGet<{ ytd_run_totals: StravaTotals; all_run_totals: StravaTotals }>(`/athletes/${id}/stats`),
    stravaGet<StravaSummaryActivity[]>('/athlete/activities?per_page=100&page=1'),
  ]);
  const runs = activities.filter(isPublicRun);

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
    })),
    weekly: bucketWeeks(runs),
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
      found.set(name, { effort: name, timeSec: effort.elapsed_time, date: localDay(run.start_date_local), activityId: run.id });
    }
  }
  return BEST_EFFORTS.flatMap((e) => found.get(e) ?? []);
}

function loadFromDisk() {
  diskLoad ??= readFile(CACHE_FILE, 'utf8')
    .then((raw) => {
      const saved: { summary?: typeof summaryCache; bests?: typeof bestsCache } = JSON.parse(raw);
      summaryCache ??= saved.summary ?? null;
      bestsCache ??= saved.bests ?? null;
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
  summaryInFlight ??= fetchSummary()
    .then((value) => {
      summaryCache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
      void saveToDisk();
      return value;
    })
    .catch((err) => {
      console.error(err);
      return null;
    })
    .finally(() => {
      summaryInFlight = null;
    });
  return summaryInFlight;
}

function refreshBests() {
  bestsInFlight ??= fetchBests()
    .then((value) => {
      bestsCache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
      void saveToDisk();
      return value;
    })
    .catch((err) => {
      console.error(err);
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

  const now = Date.now();
  if (bestsCache && bestsCache.expiresAt <= now) bestsCache = null;
  if (summaryCache && summaryCache.expiresAt <= now) summaryCache = null;

  if (!bestsCache) void refreshBests();
  const summary = summaryCache?.value ?? (await refreshSummary());

  if (!summary) return null;
  return { ...summary, bests: bestsCache?.value ?? null };
}
