'use client';
import { useEffect, useRef, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface BannedIP {
  ip: string;
  country: string;
  city?: string;
  lat: number;
  lng: number;
  reason: string;
  weight?: number;
}

interface ThreatData {
  last_updated: string;
  total_banned: number;
  recent_bans: BannedIP[];
}

export default function ThreatGlobe() {
  const [threatData, setThreatData] = useState<ThreatData | null>(null);
  const [hasError, setHasError] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isRendering, setIsRendering] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);

  useEffect(() => {
    fetch('/data/banned_ips.json')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) {
          setThreatData(data);
          setTimeout(() => setIsRendering(true), 500);
        }
      })
      .catch((err) => {
        console.error("Error loading threat data:", err);
        setHasError(true);
      });

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const aggregatedData = useMemo(() => {
    if (!threatData) return [];
    const clusters: Record<string, BannedIP> = {};

    threatData.recent_bans.forEach((ban) => {
      const latBucket = Math.round(ban.lat * 2) / 2;
      const lngBucket = Math.round(ban.lng * 2) / 2;
      const key = `${latBucket},${lngBucket}`;

      if (clusters[key]) {
        clusters[key].weight = (clusters[key].weight || 1) + 1;
      } else {
        clusters[key] = { ...ban, weight: 1 };
      }
    });

    return Object.values(clusters)
      .sort((a, b) => (b.weight || 1) - (a.weight || 1))
      .slice(0, 300);
  }, [threatData]);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.controls().minDistance = 150;
      globeRef.current.controls().maxDistance = 400;
    }
  }, [isRendering]);

  if (hasError || !threatData) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 px-3 sm:px-4 py-6 sm:py-8 mb-8 border border-[var(--terminal-border)] rounded bg-black/40 relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 matrix-bg opacity-10 pointer-events-none"></div>

      {/* HEADER - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center z-10 border-b border-[var(--terminal-border)] pb-4 gap-3 sm:gap-0">
        <div className="w-full sm:w-auto">
          <h2 className="text-lg min-[400px]:text-xl sm:text-2xl font-bold font-mono tracking-widest text-[#ef4444] glow-text drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] flex items-center gap-2">
            <span className="material-symbols-outlined pointer-events-none text-base sm:text-xl">public</span>
            GLOBAL_THREAT_MONITOR
          </h2>
        </div>

        {/* Status indicator flexes row on mobile, column on desktop */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto">
          <div className="animate-pulse bg-red-500/20 px-2 sm:px-3 py-1 rounded inline-flex items-center border border-red-500/50 cursor-help" title="Active Firewall Root Monitoring">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-1.5 sm:mr-2"></div>
            <span className="text-red-400 font-mono text-[10px] sm:text-xs font-bold tracking-widest hidden min-[400px]:inline">FW_ACTIVE</span>
            <span className="text-red-400 font-mono text-[10px] font-bold tracking-widest min-[400px]:hidden">ACT</span>
          </div>
          <p className="font-mono text-[9px] sm:text-[10px] text-[var(--terminal-text-muted)] mt-0 sm:mt-2">
            UPDATED: {threatData ? new Date(threatData.last_updated).toLocaleTimeString() : '...'}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* GLOBE ENGINE - Mobile Optimized */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[300px] sm:min-h-[450px]">
          <div className="absolute inset-0 bg-green-900/10 blur-[50px] rounded-full mix-blend-screen pointer-events-none"></div>

          <div className="w-full aspect-square relative max-w-[450px] flex items-center justify-center">
            {!isRendering && (
              <div className="absolute animate-pulse text-[var(--terminal-text-dim)] font-mono text-xs sm:text-sm flex flex-col items-center text-center">
                <span className="material-symbols-outlined animate-spin mb-2">radar</span>
                MAPPING_THREAT_VECTORS...
              </div>
            )}

            {isRendering && typeof window !== 'undefined' && aggregatedData.length > 0 && (
              <Globe
                ref={globeRef}
                width={windowWidth < 640 ? windowWidth - 32 : (windowWidth < 1024 ? 400 : 450)}
                height={windowWidth < 640 ? windowWidth - 32 : (windowWidth < 1024 ? 400 : 450)}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundColor="rgba(0,0,0,0)"
                pointsData={aggregatedData}
                pointLat="lat"
                pointLng="lng"
                pointAltitude={(d: object) => Math.min(0.1, (((d as BannedIP).weight || 1) * 0.01))}
                pointRadius={(d: object) => Math.max(0.08, Math.min(0.6, ((d as BannedIP).weight || 1) * 0.04))}
                pointColor={() => '#ef4444'}
                pointLabel={(d: object) => {
                  const ban = d as BannedIP;
                  const weight = ban.weight || 1;
                  return `
                    <div style="background: rgba(16,31,34,0.9); border: 1px solid #ef4444; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; pointer-events: none; min-width: 150px;">
                      <strong style="color: #ef4444; display: block; margin-bottom: 4px; border-bottom: 1px solid rgba(239,68,68,0.3); padding-bottom: 2px;">THREAT_ORIGIN</strong>
                      <div><span style="color: #c7cb90;">IP:</span> ${weight > 1 ? 'Multiple Host Cluster' : ban.ip}</div>
                      <div><span style="color: #c7cb90;">LOC:</span> ${ban.city ? ban.city + ', ' : ''}${ban.country} [${ban.lat.toFixed(2)}, ${ban.lng.toFixed(2)}]</div>
                      <div style="margin-top: 4px; color: #4ade80;">> ${ban.reason}</div>
                      ${weight > 1 ? `<div style="margin-top: 4px; font-size: 10px; color: #9ca3af;">[CLUSTER_SIZE: ${weight}]</div>` : ''}
                    </div>
                  `}}
                ringsData={aggregatedData}
                ringColor={() => '#ef4444'}
                ringMaxRadius={(d: object) => Math.max(2, Math.min(8, Math.log10(((d as BannedIP).weight || 1) * 10)))}
                ringPropagationSpeed={0.8}
                ringRepeatPeriod={1000}
                atmosphereColor="#0d614b"
                atmosphereAltitude={0.15}
              />
            )}
          </div>

          {/* ZOOM CONTROLS - Larger touch targets for mobile */}
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 flex flex-col gap-2 z-10">
            <button
              onClick={() => {
                if (globeRef.current) {
                  const r = globeRef.current.pointOfView().altitude;
                  globeRef.current.pointOfView({ altitude: Math.max(r - 0.5, 0.5) }, 400);
                }
              }}
              className="bg-black/50 hover:bg-white/10 border border-[var(--terminal-border)] rounded w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[18px]">add</span>
            </button>
            <button
              onClick={() => {
                if (globeRef.current) {
                  const r = globeRef.current.pointOfView().altitude;
                  globeRef.current.pointOfView({ altitude: Math.min(r + 0.5, 3) }, 400);
                }
              }}
              className="bg-black/50 hover:bg-white/10 border border-[var(--terminal-border)] rounded w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[20px] sm:text-[18px]">remove</span>
            </button>
          </div>
        </div>

        {/* DATA PANEL - Mobile Optimized */}
        <div className="w-full lg:w-1/2 font-mono flex flex-col gap-4 z-10 h-full justify-center">
          <div className="bg-[var(--terminal-bg)] border border-[var(--terminal-border)] rounded p-3 sm:p-4 shadow-[inset_0_0_10px_rgba(var(--terminal-accent-rgb),0.1)]">
            <p className="text-[10px] sm:text-xs text-[var(--terminal-text-dim)] mb-1">TOTAL_ATTACKS_MITIGATED</p>
            <p className="text-2xl sm:text-3xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              {threatData ? threatData.total_banned.toLocaleString() : '-----'}
            </p>
          </div>

          <div className="text-sm border border-[var(--terminal-border)] rounded overflow-hidden">
            <div className="bg-[var(--terminal-surface-alt)] border-b border-[var(--terminal-border)] p-2 grid grid-cols-12 gap-1 sm:gap-2 text-[9px] min-[400px]:text-[10px] sm:text-xs font-bold text-[var(--terminal-text-muted)]">
              <div className="col-span-5">SOURCE_IP</div>
              <div className="col-span-2 text-center">LOC</div>
              <div className="col-span-5">VECTOR</div>
            </div>
            <div className="p-1 sm:p-2 flex flex-col gap-1 sm:gap-2 max-h-[160px] sm:max-h-[200px] overflow-y-auto custom-scrollbar">
              {threatData?.recent_bans.slice(0, 50).map((ban, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-1 sm:gap-2 text-[9px] min-[400px]:text-[10px] sm:text-xs items-center hover:bg-[var(--terminal-surface-hover)] p-1 rounded transition-colors group/row">
                  <div className="col-span-5 text-[#ef4444] group-hover/row:text-white transition-colors truncate">
                    {ban.ip}
                  </div>
                  <div className="col-span-2 text-center text-white font-bold opacity-80 truncate" title={`${ban.country}`}>
                    {ban.country}
                  </div>
                  <div className="col-span-5 text-[var(--terminal-text-dim)] group-hover/row:text-[var(--terminal-accent-alt)] transition-colors truncate" title={ban.reason}>
                    {ban.reason}
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