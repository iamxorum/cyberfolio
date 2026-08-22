'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { dcConfig } from '../config';
import { formatRelativeTime } from '@/lib/format-time';
import { prefersReducedMotion } from '@/lib/motion';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface BannedIP {
  ip: string;
  country: string;
  city?: string;
  lat: number;
  lng: number;
  weight?: number;
  source: 'local' | 'public';
}

interface ThreatData {
  last_updated: string;
  total_banned: number;
  recent_bans: BannedIP[];
}

interface GlobePointDatum {
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

interface GlobeRingDatum {
  lat: number;
  lng: number;
  source: 'local' | 'public';
  maxRadius: number;
  repeatPeriod: number;
}

interface GlobeArcDatum {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string[];
  dashInitialGap: number;
  dashAnimateTime: number;
  source: 'local' | 'public';
}

const useCountUp = (end: number, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

const AnimatedCounter = ({ value }: { value: number }) => {
  const animatedValue = useCountUp(value);
  return <span>{animatedValue > 0 ? animatedValue.toLocaleString() : '-----'}</span>;
};

const getPointRadius = (obj: object) => {
  const d = obj as GlobePointDatum;
  if (d.isServer) return 0.8;
  return d.source === 'local' ? 0.3 : 0.15;
};
const getPointColor = (obj: object) => {
  const d = obj as GlobePointDatum;
  if (d.isServer) return '#ffffff';
  return d.source === 'local' ? '#ef4444' : '#3b82f6';
};
const getRingColor = (obj: object) => {
  const d = obj as GlobeRingDatum;
  return d.source === 'local' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.3)';
};
const getArcStroke = (obj: object) => (obj as GlobeArcDatum).source === 'local' ? 0.5 : 0.3;

const nearestNode = (lat: number, lng: number) => {
  return dcConfig.nodes.reduce((nearest, node) => {
    const dist = (node.lat - lat) ** 2 + (node.lng - lng) ** 2;
    const nearestDist = (nearest.lat - lat) ** 2 + (nearest.lng - lng) ** 2;
    return dist < nearestDist ? node : nearest;
  });
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export default function ThreatGlobe() {
  const [threatData, setThreatData] = useState<ThreatData | null>(null);
  const [hasError, setHasError] = useState(false);
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));
  const [atmosphereColor, setAtmosphereColor] = useState('#2650d7');
  const [isLight, setIsLight] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<GlobePointDatum | null>(null);
  const [panelPoint, setPanelPoint] = useState<GlobePointDatum | null>(null);

  const [isRendering, setIsRendering] = useState(false);
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [revealedBanCount, setRevealedBanCount] = useState(0);
  const [visibleSources, setVisibleSources] = useState({ local: true, public: true });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const resumeRotateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelClearTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteractionRef = useRef(Date.now());
  const spotlightIndexRef = useRef(0);

  useEffect(() => {
    if (selectedPoint) {
      if (panelClearTimeout.current) clearTimeout(panelClearTimeout.current);
      setPanelPoint(selectedPoint);
    } else {
      panelClearTimeout.current = setTimeout(() => setPanelPoint(null), 200);
    }
    return () => {
      if (panelClearTimeout.current) clearTimeout(panelClearTimeout.current);
    };
  }, [selectedPoint]);

  useEffect(() => () => {
    if (resumeRotateTimeout.current) clearTimeout(resumeRotateTimeout.current);
  }, []);

  const flyToCountry = (item: { country: string; lat: number; lng: number }) => {
    if (!globeRef.current) return;
    setSelectedPoint(null);
    const controls = globeRef.current.controls();
    controls.autoRotate = false;
    setSelectedCountry(item.country);
    globeRef.current.pointOfView({ lat: item.lat, lng: item.lng, altitude: 1.4 }, 1200);

    if (resumeRotateTimeout.current) clearTimeout(resumeRotateTimeout.current);
    resumeRotateTimeout.current = setTimeout(() => {
      if (globeRef.current) globeRef.current.controls().autoRotate = !prefersReducedMotion();
      setSelectedCountry(null);
    }, 5000);
  };

  useEffect(() => {
    fetch('/data/banned_ips.json')
      .then((res) => res.ok ? res.json() : null)
      .then((data: ThreatData | null) => {
        if (data) {
          setThreatData(data);
          setTimeout(() => setIsRendering(true), 400);
        }
      })
      .catch(() => setHasError(true));

    const syncTheme = () => {
      const accentRgb = getComputedStyle(document.documentElement).getPropertyValue('--terminal-accent-rgb').trim();
      if (accentRgb) setAtmosphereColor(`rgb(${accentRgb})`);
      setIsLight(document.documentElement.classList.contains('light'));
    };
    syncTheme();

    const themeObserver = new MutationObserver(syncTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    let resizeThrottle: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeThrottle) return;
      resizeThrottle = setTimeout(() => {
        setWindowWidth(window.innerWidth);
        resizeThrottle = null;
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeThrottle) clearTimeout(resizeThrottle);
      themeObserver.disconnect();
    };
  }, []);

  const { banPoints, serverNodes, arcsData, countryLeaderboard, ringsData } = useMemo(() => {
    if (!threatData || !threatData.recent_bans) {
      return { banPoints: [], serverNodes: [], arcsData: [], countryLeaderboard: [], ringsData: [] };
    }

    const clusters: Record<string, BannedIP> = {};
    const countryStats: Record<string, { count: number, lat: number, lng: number }> = {};
    let totalAnalyzed = 0;

    threatData.recent_bans.forEach((ban) => {
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

    const points = Object.values(clusters)
      .sort((a, b) => (b.weight || 1) - (a.weight || 1))
      .slice(0, 400);

    const nodes = dcConfig.nodes.map(node => ({ lat: node.lat, lng: node.lng, isServer: true, id: node.id, name: node.name }));

    const allArcs = points
      .filter(point => point.source === 'local')
      .map(point => {
        const node = nearestNode(point.lat, point.lng);

        const arcColors = ['rgba(239, 68, 68, 0.2)', 'rgba(239, 68, 68, 0.8)'];

        return {
          startLat: point.lat,
          startLng: point.lng,
          endLat: node.lat,
          endLng: node.lng,
          color: arcColors,
          dashInitialGap: Math.random() * 5,
          dashAnimateTime: 1500 + Math.random() * 2000,
          source: point.source
        };
      });

    const randomRings = points
      .filter((p) => p.source === 'local' || Math.random() > 0.5)
      .map(p => ({
        lat: p.lat,
        lng: p.lng,
        source: p.source,
        maxRadius: p.source === 'local' ? 2.5 : 1.2,
        repeatPeriod: p.source === 'local' ? 1500 : 3000
      }));

    const leaderboard = Object.entries(countryStats)
      .map(([country, stats]) => ({
        country,
        count: stats.count,
        percentage: (stats.count / totalAnalyzed) * 100,
        lat: stats.lat,
        lng: stats.lng,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return {
      banPoints: points,
      serverNodes: nodes,
      arcsData: allArcs,
      countryLeaderboard: leaderboard,
      ringsData: randomRings
    };
  }, [threatData]);

  // Dots load in gradually (batches, not all 400+ at once) - both for a nicer reveal
  // and to spread the three.js mesh-creation cost across frames instead of one spike.
  useEffect(() => {
    setRevealedBanCount(0);
    if (!isGlobeReady || banPoints.length === 0) return;

    if (prefersReducedMotion()) {
      setRevealedBanCount(banPoints.length);
      return;
    }

    const INTERVAL_MS = 100;
    const TOTAL_STEPS = 40; // ~4s total reveal, regardless of dataset size
    const BATCH_SIZE = Math.max(1, Math.ceil(banPoints.length / TOTAL_STEPS));
    const interval = setInterval(() => {
      setRevealedBanCount((count) => {
        const next = count + BATCH_SIZE;
        if (next >= banPoints.length) {
          clearInterval(interval);
          return banPoints.length;
        }
        return next;
      });
    }, INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isGlobeReady, banPoints]);

  const revealedBanPoints = useMemo(() => banPoints.slice(0, revealedBanCount), [banPoints, revealedBanCount]);
  const revealedKey = (p: { lat: number; lng: number; source: 'local' | 'public' }) => `${p.lat},${p.lng},${p.source}`;
  const revealedKeySet = useMemo(() => new Set(revealedBanPoints.map(revealedKey)), [revealedBanPoints]);

  const visiblePointsData = useMemo(
    () => [...revealedBanPoints.filter((p) => visibleSources[p.source]), ...serverNodes],
    [revealedBanPoints, serverNodes, visibleSources]
  );
  const visibleArcsData = useMemo(
    () => arcsData.filter((a) => visibleSources[a.source] && revealedKeySet.has(`${a.startLat},${a.startLng},${a.source}`)),
    [arcsData, visibleSources, revealedKeySet]
  );
  const visibleRingsData = useMemo(
    () => ringsData.filter((r) => visibleSources[r.source] && revealedKeySet.has(revealedKey(r))),
    [ringsData, visibleSources, revealedKeySet]
  );

  useEffect(() => {
    if (globeRef.current && isGlobeReady) {
      const controls = globeRef.current.controls();
      controls.autoRotate = !prefersReducedMotion();
      controls.autoRotateSpeed = 0.5;
      controls.enableDamping = true;
      controls.minDistance = 150;
      controls.maxDistance = 450;

      globeRef.current.pointOfView(dcConfig.mapCenter, 1500);
    }
  }, [isGlobeReady]);

  useEffect(() => {
    if (!isGlobeReady || prefersReducedMotion() || countryLeaderboard.length === 0) return;
    const top3 = countryLeaderboard.slice(0, 3);
    const interval = setInterval(() => {
      if (Date.now() - lastInteractionRef.current < 15000) return;
      const next = top3[spotlightIndexRef.current % top3.length];
      spotlightIndexRef.current += 1;
      flyToCountry(next);
    }, 15000);
    return () => clearInterval(interval);
  }, [isGlobeReady, countryLeaderboard]);

  const getRankColor = (idx: number) => {
    if (idx < 3) return 'bg-[#ef4444] shadow-[0_0_5px_#ef4444]';
    if (idx < 7) return 'bg-[#fbbf24]';
    return 'bg-[#22c55e]';
  };

  if (hasError || !threatData) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 mb-8 border border-[var(--terminal-border)] rounded bg-[rgba(var(--terminal-bg-rgb),0.60)] text-center font-mono">
        <span className="material-symbols-outlined text-3xl text-[var(--terminal-text-dim)]">satellite_alt</span>
        <p className="text-sm text-[var(--terminal-text-dim)]">Threat feed unavailable</p>
        <p className="text-xs text-[var(--terminal-text-muted)] max-w-xs">
          Live firewall data couldn&apos;t be loaded right now...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-5 py-6 sm:py-8 mb-8 border border-[var(--terminal-border)] rounded bg-[rgba(var(--terminal-bg-rgb),0.60)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-noise-texture opacity-10 mix-blend-overlay pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center z-10 border-b border-[var(--terminal-border)] pb-4 gap-3 relative">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold font-mono tracking-widest text-[#ef4444] glow-text flex items-center gap-2">
            <span className="material-symbols-outlined">radar</span>
            THREAT_FEED
          </h2>
          <p className="text-xs text-[var(--terminal-text-muted)] mt-1">
            <span className="text-[#ef4444] font-bold">Local</span> Fail2Ban & <span className="text-[#3b82f6] font-bold">Public</span> CrowdSec CAPI
          </p>
          {threatData.last_updated && (
            <p className="text-[10px] text-[var(--terminal-text-dim)] mt-1">
              Last synced: {formatRelativeTime(threatData.last_updated)}
            </p>
          )}
        </div>
      </div>

      {/* --- CONTENT (2 COLUMNS) --- */}
      <div className="flex flex-col lg:flex-row gap-6 items-center relative z-10">

        {/* LEFT COLUMN: GLOBE */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[300px] sm:min-h-[450px] xl:min-h-[550px] border border-[var(--terminal-border)]/20 rounded bg-[rgba(var(--terminal-bg-rgb),0.20)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-[rgba(var(--terminal-accent-rgb),0.10)] to-transparent pointer-events-none animate-panel-scan z-10"></div>

          <div
            className="w-full aspect-square relative max-w-[450px] xl:max-w-[550px] flex items-center justify-center"
            onPointerDown={() => { lastInteractionRef.current = Date.now(); }}
          >
            {isRendering && (
              <div
                className="absolute inset-0 z-[5] pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, transparent 55%, rgba(var(--terminal-bg-rgb),0.85) 100%)' }}
              />
            )}

            {!isGlobeReady && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[rgba(var(--terminal-bg-rgb),0.40)] backdrop-blur-sm rounded-full animate-pulse text-[#ef4444] font-mono text-xs">
                <span className="material-symbols-outlined animate-spin mb-2">satellite_alt</span>
                RENDERING_GLOBE...
              </div>
            )}

            {isRendering && typeof window !== 'undefined' && (banPoints.length > 0 || serverNodes.length > 0) && (
              <>
                <Globe
                  ref={globeRef}
                  onGlobeReady={() => setIsGlobeReady(true)}
                  width={windowWidth < 640 ? windowWidth - 80 : windowWidth < 1024 ? 350 : windowWidth < 1280 ? 400 : 500}
                  height={windowWidth < 640 ? windowWidth - 80 : windowWidth < 1024 ? 350 : windowWidth < 1280 ? 400 : 500}
                  globeImageUrl={isLight ? 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg' : 'https://unpkg.com/three-globe/example/img/earth-dark.jpg'}
                  backgroundColor="rgba(0,0,0,0)"

                  pointsData={visiblePointsData}
                  pointAltitude={0.01}
                  pointRadius={getPointRadius}
                  pointsTransitionDuration={600}
                  pointColor={getPointColor}
                  pointLabel={(obj: object) => {
                    const p = obj as GlobePointDatum;
                    if (p.isServer) {
                      const name = p.name ? ` &middot; ${escapeHtml(p.name)}` : '';
                      return `<div class="globe-tooltip">${escapeHtml(p.id ?? 'Node')}${name}</div>`;
                    }
                    if (!p.country) return '';
                    const city = p.city ? ` &middot; ${escapeHtml(p.city)}` : '';
                    return `<div class="globe-tooltip">${escapeHtml(p.country)}${city}</div>`;
                  }}
                  onPointClick={(point: object) => {
                    const p = point as GlobePointDatum;
                    if (!p.isServer) {
                      lastInteractionRef.current = Date.now();
                      setSelectedPoint(p);
                    }
                  }}

                  ringsData={visibleRingsData}
                  ringColor={getRingColor}
                  ringMaxRadius={(obj: object) => (obj as GlobeRingDatum).maxRadius}
                  ringRepeatPeriod={(obj: object) => (obj as GlobeRingDatum).repeatPeriod}
                  ringPropagationSpeed={0.8}

                  arcsData={visibleArcsData}
                  arcColor={(obj: object) => (obj as GlobeArcDatum).color}
                  arcStroke={getArcStroke}
                  arcDashLength={0.4}
                  arcDashGap={0.5}
                  arcDashInitialGap={(obj: object) => (obj as GlobeArcDatum).dashInitialGap}
                  arcDashAnimateTime={(obj: object) => (obj as GlobeArcDatum).dashAnimateTime}
                  arcAltitudeAutoScale={0.5}

                  atmosphereColor={atmosphereColor}
                  atmosphereAltitude={0.1}
                />

                <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-1.5 font-mono text-[9px] bg-[rgba(var(--terminal-bg-rgb),0.40)] p-2 rounded border border-[rgba(var(--terminal-text-rgb),0.5)] backdrop-blur-sm">
                  <button
                    type="button"
                    onClick={() => setVisibleSources((v) => ({ ...v, local: !v.local }))}
                    aria-pressed={visibleSources.local}
                    title={visibleSources.local ? 'Hide local attacks' : 'Show local attacks'}
                    className={`flex items-center gap-2 -m-0.5 p-0.5 rounded transition-[opacity,background-color] duration-150 ease-out active:scale-[0.97] hover:bg-[rgba(var(--terminal-text-rgb),0.08)] ${visibleSources.local ? 'opacity-100' : 'opacity-35'}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse shadow-[0_0_5px_#ef4444]"></div>
                    <span className="text-[var(--terminal-text)]/70 uppercase">Local_Attack (Fail2Ban)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibleSources((v) => ({ ...v, public: !v.public }))}
                    aria-pressed={visibleSources.public}
                    title={visibleSources.public ? 'Hide community blacklist' : 'Show community blacklist'}
                    className={`flex items-center gap-2 -m-0.5 p-0.5 rounded transition-[opacity,background-color] duration-150 ease-out active:scale-[0.97] hover:bg-[rgba(var(--terminal-text-rgb),0.08)] ${visibleSources.public ? 'opacity-100' : 'opacity-35'}`}
                  >
                    <div className="w-2 h-2 rounded-full bg-[#3b82f6] shadow-[0_0_5px_#3b82f6]"></div>
                    <span className="text-[var(--terminal-text)]/70 uppercase">Community_Blacklist (CAPI)</span>
                  </button>
                </div>

                {panelPoint && (
                  <div
                    className="absolute top-2 right-2 z-20 flex flex-col gap-1 font-mono text-[10px] bg-[rgba(var(--terminal-bg-rgb),0.85)] p-2.5 rounded border border-[var(--terminal-border)] backdrop-blur-sm max-w-[180px]"
                    style={{
                      opacity: selectedPoint ? 1 : 0,
                      transform: selectedPoint ? 'scale(1)' : 'scale(0.95)',
                      pointerEvents: selectedPoint ? 'auto' : 'none',
                      transition: 'opacity 200ms ease-out, transform 200ms ease-out',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {panelPoint.country && (
                          <Image
                            src={`https://flagcdn.com/w20/${panelPoint.country.toLowerCase()}.png`}
                            alt=""
                            width={14}
                            height={10}
                            style={{ width: '14px', height: '10px' }}
                            className="rounded-[1px] flex-shrink-0"
                            unoptimized
                          />
                        )}
                        <span className="text-[var(--terminal-text)] font-bold">{panelPoint.country}</span>
                      </div>
                      <button
                        onClick={() => setSelectedPoint(null)}
                        aria-label="Close"
                        className="text-[var(--terminal-text-dim)] hover:text-[var(--terminal-text)] active:scale-90 transition-transform leading-none -mt-0.5"
                      >
                        ×
                      </button>
                    </div>
                    {panelPoint.city && (
                      <span className="text-[var(--terminal-text-muted)]">{panelPoint.city}</span>
                    )}
                    <span className={panelPoint.source === 'local' ? 'text-[#ef4444]' : 'text-[#3b82f6]'}>
                      {panelPoint.source === 'local' ? 'Local (Fail2Ban)' : 'Public (CrowdSec)'}
                    </span>
                    {panelPoint.ip && (
                      <span className="text-[var(--terminal-text-dim)] truncate">{panelPoint.ip}</span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: STATS */}
        <div className="w-full lg:w-1/2 font-mono flex flex-col gap-4 flex-1">
          <div className="bg-[var(--terminal-surface-alt)] border border-[var(--terminal-border)] rounded p-4 relative overflow-hidden">
            <p className="text-[10px] text-[var(--terminal-text-muted)] mb-1">TOTAL_MITIGATED_IPS</p>
            <p className="text-4xl font-bold text-[var(--terminal-text)] tracking-tighter">
              <AnimatedCounter value={threatData?.total_banned || 0} />
            </p>
          </div>

          <div className="text-sm border border-[var(--terminal-border)] rounded overflow-hidden bg-[rgba(var(--terminal-bg-rgb),0.40)] w-full">
            <div className="bg-[var(--terminal-surface-alt)] border-b border-[var(--terminal-border)] p-2 grid grid-cols-12 text-[10px] font-bold text-[var(--terminal-text-muted)] tracking-widest">
              <div className="col-span-2 text-center">RK</div>
              <div className="col-span-3">ORIGIN</div>
              <div className="col-span-3 text-right">COUNT</div>
              <div className="col-span-4 pl-4 text-center">THREAT</div>
            </div>

            <div className="p-1 flex flex-col gap-1 max-h-[220px] overflow-y-auto custom-scrollbar">
              {countryLeaderboard.map((item, idx) => (
                <button
                  key={item.country}
                  onClick={() => flyToCountry(item)}
                  disabled={!isGlobeReady}
                  title={`Fly the globe to ${item.country}`}
                  className={`grid grid-cols-12 w-full text-left text-[10px] items-center p-1.5 rounded transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.98] group/row disabled:cursor-default ${
                    selectedCountry === item.country
                      ? 'bg-[rgba(var(--terminal-text-rgb),0.10)]'
                      : 'hover:bg-[rgba(var(--terminal-text-rgb),0.05)]'
                  }`}
                >
                  <div className="col-span-2 text-center text-[var(--terminal-text-dim)]">[{String(idx + 1).padStart(2, '0')}]</div>
                  <div className={`col-span-3 font-bold truncate flex items-center gap-1.5 ${selectedCountry === item.country ? 'text-[#ef4444]' : 'text-[var(--terminal-text)]'}`}>
                    <Image
                      src={`https://flagcdn.com/w20/${item.country.toLowerCase()}.png`}
                      alt=""
                      width={14}
                      height={10}
                      style={{ width: '14px', height: '10px' }}
                      className="rounded-[1px] flex-shrink-0"
                      unoptimized
                    />
                    {item.country}
                  </div>
                  <div className="col-span-3 text-right text-[var(--terminal-text-dim)] group-hover/row:text-[#ef4444] transition-colors">
                    {item.count.toLocaleString()}
                  </div>
                  <div className="col-span-4 pl-3 flex items-center gap-2">
                    <div className="h-1 w-full bg-[#111] rounded-full overflow-hidden border border-[#222]">
                      <div
                        className={`h-full w-full origin-left transition-transform duration-700 ease-out ${getRankColor(idx)}`}
                        style={{ transform: `scaleX(${item.percentage / 100})` }}
                      ></div>
                    </div>
                    <span className="text-[8px] text-[var(--terminal-text-muted)] w-6 text-right">{Math.ceil(item.percentage)}%</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}