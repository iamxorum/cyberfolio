// Server-only Steam client. The API key never reaches the browser: the page renders from
// this module's in-memory cache (30min). Needs the Steam profile and "Game details" set to Public.

const API = 'https://api.steampowered.com';
const STORE_API = 'https://store.steampowered.com/api/appdetails';
const CACHE_TTL_MS = 30 * 60 * 1000;
const TOP_COUNT = 6;
const RECENT_COUNT = 5;

export interface SteamGame {
  appId: number;
  name: string;
  totalHours: number;
  recentHours: number;
  headerUrl: string;
}

export interface GamingData {
  personaName: string;
  profileUrl: string;
  avatarUrl: string;
  nowPlaying: string | null;
  gameCount: number;
  totalHours: number;
  top: SteamGame[];
  recent: SteamGame[];
  fetchedAt: string;
}

interface SteamOwnedGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
}

interface SteamPlayer {
  personaname: string;
  profileurl: string;
  avatarfull: string;
  gameextrainfo?: string;
}

let cache: { value: GamingData; expiresAt: number } | null = null;
let inFlight: Promise<GamingData | null> | null = null;

const isConfigured = () => Boolean(process.env.STEAM_API_KEY && process.env.STEAM_ID);

async function steamGet<T>(path: string, params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams({ key: process.env.STEAM_API_KEY!, steamid: process.env.STEAM_ID!, format: 'json', ...params });
  const res = await fetch(`${API}${path}?${query}`, { cache: 'no-store' });
  // Status only: the URL carries the key, so it must never end up in an error message or log.
  if (!res.ok) throw new Error(`Steam ${path} failed: ${res.status}`);
  return res.json();
}

const toHours = (minutes: number) => Math.round((minutes / 60) * 10) / 10;

const classicHeader = (appId: number) => `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;

const toGame = (g: SteamOwnedGame): SteamGame => ({
  appId: g.appid,
  name: g.name,
  totalHours: toHours(g.playtime_forever),
  recentHours: toHours(g.playtime_2weeks ?? 0),
  headerUrl: classicHeader(g.appid),
});

// Newer apps serve their banner from a hashed path that only the store API reveals. A failed
// lookup keeps the classic URL, which the component handles by showing a placeholder.
async function withStoreHeaders(games: SteamGame[]): Promise<SteamGame[]> {
  return Promise.all(
    games.map(async (game) => {
      try {
        const res = await fetch(`${STORE_API}?appids=${game.appId}&filters=basic`, { cache: 'no-store' });
        if (!res.ok) return game;
        const body: Record<string, { success: boolean; data?: { header_image?: string } }> = await res.json();
        const url = body[game.appId]?.data?.header_image;
        return url?.startsWith('https://') ? { ...game, headerUrl: url } : game;
      } catch {
        return game;
      }
    })
  );
}

async function fetchGaming(): Promise<GamingData> {
  const [owned, summary] = await Promise.all([
    steamGet<{ response: { game_count?: number; games?: SteamOwnedGame[] } }>('/IPlayerService/GetOwnedGames/v1/', {
      include_appinfo: '1',
      include_played_free_games: '1',
    }),
    steamGet<{ response: { players?: SteamPlayer[] } }>('/ISteamUser/GetPlayerSummaries/v2/', { steamids: process.env.STEAM_ID! }),
  ]);

  const player = summary.response.players?.[0];
  // Private "Game details" returns an empty library; treat it as offline instead of showing zeros.
  const games = owned.response.games;
  if (!player || !games) throw new Error('Steam profile or game details are not public');

  const played = games.filter((g) => g.playtime_forever > 0);
  const top = [...played].sort((a, b) => b.playtime_forever - a.playtime_forever).slice(0, TOP_COUNT).map(toGame);
  const recent = games
    .filter((g) => (g.playtime_2weeks ?? 0) > 0)
    .sort((a, b) => (b.playtime_2weeks ?? 0) - (a.playtime_2weeks ?? 0))
    .slice(0, RECENT_COUNT)
    .map(toGame);
  const resolved = await withStoreHeaders([...new Map([...top, ...recent].map((g) => [g.appId, g])).values()]);
  const byId = new Map(resolved.map((g) => [g.appId, g]));
  const withHeader = (g: SteamGame) => ({ ...g, headerUrl: byId.get(g.appId)?.headerUrl ?? g.headerUrl });

  return {
    personaName: player.personaname,
    profileUrl: player.profileurl,
    avatarUrl: player.avatarfull,
    nowPlaying: player.gameextrainfo ?? null,
    gameCount: owned.response.game_count ?? games.length,
    totalHours: toHours(played.reduce((sum, g) => sum + g.playtime_forever, 0)),
    top: top.map(withHeader),
    recent: recent.map(withHeader),
    fetchedAt: new Date().toISOString(),
  };
}

export async function getGamingData(): Promise<GamingData | null> {
  if (!isConfigured()) return null;
  if (cache && cache.expiresAt > Date.now()) return cache.value;

  inFlight ??= fetchGaming()
    .then((value) => {
      cache = { value, expiresAt: Date.now() + CACHE_TTL_MS };
      return value;
    })
    .catch((err) => {
      console.error(err);
      return null;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}
