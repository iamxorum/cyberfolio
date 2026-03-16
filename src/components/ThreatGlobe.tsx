'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { dcConfig } from '../config';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface BannedIP {
  ip: string;
  country: string;
  city?: string;
  lat: number;
  lng: number;
  weight?: number;
}

interface ThreatData {
  last_updated: string;
  total_banned: number;
  recent_bans: BannedIP[];
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

export default function ThreatGlobe() {
  const [threatData, setThreatData] = useState<ThreatData | null>(null);
  const [hasError, setHasError] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

  const [isRendering, setIsRendering] = useState(false);
  const [isGlobeReady, setIsGlobeReady] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const animatedTotal = useCountUp(threatData?.total_banned || 0);

  useEffect(() => {
    fetch('/data/banned_ips.json')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) {
          setThreatData(data);
          setTimeout(() => setIsRendering(true), 400);
        }
      })
      .catch(() => setHasError(true));

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { aggregatedData, arcsData, countryLeaderboard, ringsData } = useMemo(() => {
    if (!threatData || !threatData.recent_bans) {
      return { aggregatedData: [], arcsData: [], countryLeaderboard: [], ringsData: [] };
    }

    const clusters: Record<string, BannedIP> = {};
    const countryStats: Record<string, { count: number, lat: number, lng: number }> = {};
    let totalAnalyzed = 0;

    threatData.recent_bans.forEach((ban) => {
      totalAnalyzed++;

      const latBucket = Math.round(ban.lat * 2) / 2;
      const lngBucket = Math.round(ban.lng * 2) / 2;
      const key = `${latBucket},${lngBucket}`;
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
      .slice(0, 250);

    // ARC DATA: Dynamically assign each attack to a random node from the config
    const allArcs = points.map(point => {
      // Pick a random data center node from your config
      const randomNode = dcConfig.nodes[Math.floor(Math.random() * dcConfig.nodes.length)];

      return {
        startLat: point.lat,
        startLng: point.lng,
        endLat: randomNode.lat,
        endLng: randomNode.lng,
        color: ['rgba(133, 47, 209, 0.21)', 'rgba(239, 68, 68, 0.72)'],
        dashInitialGap: Math.random() * 5,
        dashAnimateTime: 2000 + Math.random() * 4000
      };
    });

    const randomRings = points
      .filter(() => Math.random() > 0.4)
      .slice(0, 100)
      .map(p => ({
        lat: p.lat,
        lng: p.lng,
        isServer: false,
        maxRadius: Math.random() * 1.5 + 0.5,
        repeatPeriod: 1000 + Math.random() * 3000
      }));

    dcConfig.nodes.forEach(node => {
      randomRings.push({
        lat: node.lat,
        lng: node.lng,
        isServer: true,
        maxRadius: 4,
        repeatPeriod: 2000
      });
    });

    const leaderboard = Object.entries(countryStats)
      .map(([country, stats]) => ({
        country,
        count: stats.count,
        percentage: (stats.count / totalAnalyzed) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return {
      aggregatedData: points,
      arcsData: allArcs,
      countryLeaderboard: leaderboard,
      ringsData: randomRings
    };
  }, [threatData]);

  useEffect(() => {
    if (globeRef.current && isGlobeReady) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableDamping = true;
      controls.minDistance = 150;
      controls.maxDistance = 450;

      globeRef.current.pointOfView(dcConfig.mapCenter, 1500);
    }
  }, [isGlobeReady]);

  const getRankColor = (idx: number) => {
    if (idx < 3) return 'bg-[#ef4444] shadow-[0_0_5px_#ef4444]';
    if (idx < 7) return 'bg-[#fbbf24]';
    return 'bg-[#22c55e]';
  };

  if (hasError || !threatData) return null;

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-5 py-6 sm:py-8 mb-8 border border-[var(--terminal-border)] rounded bg-black/60 relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center z-10 border-b border-[var(--terminal-border)] pb-4 gap-3 relative">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold font-mono tracking-widest text-[#ef4444] glow-text flex items-center gap-2">
            <span className="material-symbols-outlined">radar</span>
            GLOBAL_THREAT_MONITOR
          </h2>
          <p className="text-xs text-[var(--terminal-text-muted)]">Crowdsec's CAPI & local Fail2Ban</p>
        </div>
        <div className="bg-green-500/10 px-3 py-1 rounded border border-green-500/30 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 font-mono text-xs font-bold tracking-widest">FIREWALL_ACTIVE</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center relative z-10">
        <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[300px] sm:min-h-[450px] border border-[var(--terminal-border)]/20 rounded bg-black/20">

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
            <div className="w-64 h-64 border border-[var(--terminal-border)] rounded-full animate-[spin_20s_linear_infinite] border-dashed"></div>
          </div>

          <div className="w-full aspect-square relative max-w-[450px] flex items-center justify-center">

            {!isGlobeReady && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm rounded-full animate-pulse text-[#ef4444] font-mono text-xs">
                <span className="material-symbols-outlined animate-spin mb-2">satellite_alt</span>
                COMPILING_MULTI_NODE_MAP...
              </div>
            )}

            {isRendering && typeof window !== 'undefined' && aggregatedData.length > 0 && (
              <Globe
                ref={globeRef}
                onGlobeReady={() => setIsGlobeReady(true)}
                width={windowWidth < 640 ? windowWidth - 64 : (windowWidth < 1024 ? 380 : 450)}
                height={windowWidth < 640 ? windowWidth - 64 : (windowWidth < 1024 ? 380 : 450)}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                backgroundColor="rgba(0,0,0,0)"

                pointsData={[
                  ...aggregatedData,
                  ...dcConfig.nodes.map(node => ({ lat: node.lat, lng: node.lng, isServer: true }))
                ]}
                pointAltitude={(d: any) => d.isServer ? 0.02 : 0.01}
                pointRadius={(d: any) => d.isServer ? 0.8 : 0.15}
                pointColor={(d: any) => d.isServer ? '#3b82f6' : '#5244efff'}

                ringsData={ringsData}
                ringColor={(d: any) => d.isServer ? '#3b82f6' : 'rgba(239, 68, 68, 0.4)'}
                ringMaxRadius={(d: any) => d.maxRadius}
                ringRepeatPeriod={(d: any) => d.repeatPeriod}
                ringPropagationSpeed={0.8}

                arcsData={arcsData}
                arcColor={(d: any) => d.color}
                arcDashLength={0.4}
                arcDashGap={0.5}
                arcDashInitialGap={(d: any) => d.dashInitialGap}
                arcDashAnimateTime={(d: any) => d.dashAnimateTime}
                arcAltitudeAutoScale={0.5}

                atmosphereColor="#2650d7ff"
                atmosphereAltitude={0.1}
              />
            )}
          </div>
        </div>

        <div className="w-full lg:w-1/2 font-mono flex flex-col gap-4">
          <div className="bg-[var(--terminal-surface-alt)] border border-[var(--terminal-border)] rounded p-4 relative overflow-hidden">
            <p className="text-[10px] text-[var(--terminal-text-muted)] mb-1">TOTAL_MITIGATED_IPS</p>
            <p className="text-4xl font-bold text-white tracking-tighter">
              {animatedTotal > 0 ? animatedTotal.toLocaleString() : '-----'}
            </p>
          </div>

          <div className="text-sm border border-[var(--terminal-border)] rounded overflow-hidden bg-black/40">
            <div className="bg-[var(--terminal-surface-alt)] border-b border-[var(--terminal-border)] p-2 grid grid-cols-12 text-[10px] font-bold text-[var(--terminal-text-muted)] tracking-widest">
              <div className="col-span-2 text-center">RANK</div>
              <div className="col-span-3">ORIGIN</div>
              <div className="col-span-3 text-right">COUNT</div>
              <div className="col-span-4 pl-4">THREAT_LVL</div>
            </div>

            <div className="p-1 flex flex-col gap-1 max-h-[220px] overflow-y-auto custom-scrollbar">
              {countryLeaderboard.map((item, idx) => (
                <div key={item.country} className="grid grid-cols-12 text-[10px] items-center hover:bg-white/5 p-1.5 rounded transition-all group/row">
                  <div className="col-span-2 text-center text-[var(--terminal-text-dim)]">[{String(idx + 1).padStart(2, '0')}]</div>
                  <div className="col-span-3 font-bold text-white truncate">{item.country}</div>
                  <div className="col-span-3 text-right text-[var(--terminal-text-dim)] group-hover/row:text-[#ef4444] transition-colors">
                    {item.count.toLocaleString()}
                  </div>
                  <div className="col-span-4 pl-3 flex items-center gap-2">
                    <div className="h-1 w-full bg-[#111] rounded-full overflow-hidden border border-[#222]">
                      <div className={`h-full transition-all duration-1000 ${getRankColor(idx)}`} style={{ width: `${item.percentage}%` }}></div>
                    </div>
                    <span className="text-[8px] text-[var(--terminal-text-muted)] w-6 text-right">{Math.ceil(item.percentage)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}