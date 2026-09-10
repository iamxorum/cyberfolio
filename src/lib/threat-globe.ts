import { dcConfig } from '@/config';

export interface BannedIP {
  ip: string;
  country: string;
  city?: string;
  lat: number;
  lng: number;
  weight?: number;
  source: 'local' | 'public';
}

export interface ThreatData {
  last_updated: string;
  total_banned: number;
  recent_bans: BannedIP[];
}

export interface GlobePointDatum {
  lat: number;
  lng: number;
  source?: 'local' | 'public';
  isServer?: boolean;
  id?: string;
  name?: string;
  ip?: string;
  country?: string;
  city?: string;
}

export interface GlobeRingDatum {
  lat: number;
  lng: number;
  source: 'local' | 'public';
  maxRadius: number;
  repeatPeriod: number;
}

export interface GlobeArcDatum {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string[];
  dashInitialGap: number;
  dashAnimateTime: number;
  source: 'local' | 'public';
}

export interface CountryLeaderboardEntry {
  country: string;
  count: number;
  percentage: number;
  lat: number;
  lng: number;
}

export const getPointRadius = (obj: object) => {
  const d = obj as GlobePointDatum;
  if (d.isServer) return 0.8;
  return d.source === 'local' ? 0.3 : 0.15;
};

export const getPointColor = (obj: object) => {
  const d = obj as GlobePointDatum;
  if (d.isServer) return '#ffffff';
  return d.source === 'local' ? '#ef4444' : '#3b82f6';
};

export const getRingColor = (obj: object) => {
  const d = obj as GlobeRingDatum;
  return d.source === 'local' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.3)';
};

export const getArcStroke = (obj: object) => (obj as GlobeArcDatum).source === 'local' ? 0.5 : 0.3;

export const nearestNode = (lat: number, lng: number) => {
  return dcConfig.nodes.reduce((nearest, node) => {
    const dist = (node.lat - lat) ** 2 + (node.lng - lng) ** 2;
    const nearestDist = (nearest.lat - lat) ** 2 + (nearest.lng - lng) ** 2;
    return dist < nearestDist ? node : nearest;
  });
};

export const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export const revealedKey = (p: { lat: number; lng: number; source: 'local' | 'public' }) => `${p.lat},${p.lng},${p.source}`;

function clusterBans(recentBans: BannedIP[]) {
  const clusters: Record<string, BannedIP> = {};
  const countryStats: Record<string, { count: number; lat: number; lng: number }> = {};
  let totalAnalyzed = 0;

  recentBans.forEach((ban) => {
    totalAnalyzed++;
    const latBucket = Math.round(ban.lat * 2) / 2;
    const lngBucket = Math.round(ban.lng * 2) / 2;
    const key = `${latBucket},${lngBucket},${ban.source}`;

    if (clusters[key]) {
      clusters[key].weight = (clusters[key].weight || 1) + 1;
    } else {
      clusters[key] = { ...ban, weight: 1 };
    }

    if (!countryStats[ban.country]) {
      countryStats[ban.country] = { count: 0, lat: ban.lat, lng: ban.lng };
    }
    countryStats[ban.country].count++;
  });

  return { clusters, countryStats, totalAnalyzed };
}

function buildArcs(points: BannedIP[]): GlobeArcDatum[] {
  return points
    .filter((point) => point.source === 'local')
    .map((point) => {
      const node = nearestNode(point.lat, point.lng);
      return {
        startLat: point.lat,
        startLng: point.lng,
        endLat: node.lat,
        endLng: node.lng,
        color: ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.8)'],
        dashInitialGap: Math.random() * 5,
        dashAnimateTime: 1500 + Math.random() * 2000,
        source: point.source,
      };
    });
}

function buildRings(points: BannedIP[]): GlobeRingDatum[] {
  return points
    .filter((p) => p.source === 'local' || Math.random() > 0.5)
    .map((p) => ({
      lat: p.lat,
      lng: p.lng,
      source: p.source,
      maxRadius: p.source === 'local' ? 2.5 : 1.2,
      repeatPeriod: p.source === 'local' ? 1500 : 3000,
    }));
}

function buildLeaderboard(countryStats: Record<string, { count: number; lat: number; lng: number }>, totalAnalyzed: number): CountryLeaderboardEntry[] {
  return Object.entries(countryStats)
    .map(([country, stats]) => ({
      country,
      count: stats.count,
      percentage: (stats.count / totalAnalyzed) * 100,
      lat: stats.lat,
      lng: stats.lng,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

export interface ThreatGeometry {
  banPoints: BannedIP[];
  serverNodes: GlobePointDatum[];
  arcsData: GlobeArcDatum[];
  countryLeaderboard: CountryLeaderboardEntry[];
  ringsData: GlobeRingDatum[];
}

const EMPTY_GEOMETRY: ThreatGeometry = { banPoints: [], serverNodes: [], arcsData: [], countryLeaderboard: [], ringsData: [] };

export function computeThreatGeometry(threatData: ThreatData | null): ThreatGeometry {
  if (!threatData || !threatData.recent_bans) return EMPTY_GEOMETRY;

  const { clusters, countryStats, totalAnalyzed } = clusterBans(threatData.recent_bans);
  const points = Object.values(clusters)
    .sort((a, b) => (b.weight || 1) - (a.weight || 1))
    .slice(0, 400);
  const serverNodes = dcConfig.nodes.map((node) => ({ lat: node.lat, lng: node.lng, isServer: true, id: node.id, name: node.name }));

  return {
    banPoints: points,
    serverNodes,
    arcsData: buildArcs(points),
    countryLeaderboard: buildLeaderboard(countryStats, totalAnalyzed),
    ringsData: buildRings(points),
  };
}
