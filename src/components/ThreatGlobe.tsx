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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);

  useEffect(() => {
    fetch('/data/banned_ips.json')
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) setThreatData(data);
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

  // Aggregating points for density
  const aggregatedData = useMemo(() => {
    if (!threatData) return [];

    // Simple clustering logic: if an IP drops into a similar latitude/longitude bucket
    // (within roughly 100km radius), we increase its weight rather than rendering 100 dots in the same spot
    const clusters: Record<string, BannedIP> = {};

    threatData.recent_bans.forEach((ban) => {
      // Round lat/lng to group nearby points (e.g. 1 decimal point is roughly 11km)
      const latBucket = Math.round(ban.lat * 2) / 2;
      const lngBucket = Math.round(ban.lng * 2) / 2;
      const key = `${latBucket},${lngBucket}`;

      if (clusters[key]) {
        clusters[key].weight = (clusters[key].weight || 1) + 1;
        // Keep the latest reason/ip just for tooltip
      } else {
        clusters[key] = { ...ban, weight: 1 };
      }
    });

    return Object.values(clusters);
  }, [threatData]);

  useEffect(() => {
    if (globeRef.current) {
      // Auto-rotate the globe slowly
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;

      // Limit zoom so user can't zoom out infinitely into space or into the core
      globeRef.current.controls().minDistance = 150;
      globeRef.current.controls().maxDistance = 400;
    }
  }, [threatData]);

  if (hasError || !threatData) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-8 mb-8 border border-[var(--terminal-border)] rounded bg-black/40 relative overflow-hidden group">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>
      <div className="absolute inset-0 matrix-bg opacity-10 pointer-events-none"></div>

      <div className="flex justify-between items-start z-10 border-b border-[var(--terminal-border)] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-widest text-[#ef4444] glow-text drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] flex items-center gap-2">
            <span className="material-symbols-outlined pointer-events-none">public</span>
            GLOBAL_THREAT_MONITOR
          </h2>
        </div>
        <div className="text-right">
          <div className="animate-pulse bg-red-500/20 px-3 py-1 rounded inline-flex items-center border border-red-500/50 cursor-help" title="Active Firewall Root Monitoring">
            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            <span className="text-red-400 font-mono text-xs font-bold tracking-widest hidden sm:inline">FW_ACTIVE</span>
            <span className="text-red-400 font-mono text-xs font-bold tracking-widest sm:hidden">ACT</span>
          </div>
          <p className="font-mono text-[10px] text-[var(--terminal-text-muted)] mt-2">
            UPDATED: {threatData ? new Date(threatData.last_updated).toLocaleTimeString() : '...'}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center">
        {/* The Interactive Globe Engine */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[350px] sm:min-h-[450px]">
          {/* Subtle glow behind globe */}
          <div className="absolute inset-0 bg-green-900/10 blur-[50px] rounded-full mix-blend-screen pointer-events-none"></div>

          <div className="w-full aspect-square relative max-w-[450px]">
            {typeof window !== 'undefined' && aggregatedData.length > 0 && (
              <Globe
                ref={globeRef}
                width={windowWidth < 640 ? windowWidth - 60 : (windowWidth < 1024 ? 400 : 450)}
                height={windowWidth < 640 ? windowWidth - 60 : (windowWidth < 1024 ? 400 : 450)}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundColor="rgba(0,0,0,0)"

                // Interactive points
                pointsData={aggregatedData}
                pointLat="lat"
                pointLng="lng"
                pointAltitude={(d: object) => Math.min(0.1, (((d as BannedIP).weight || 1) * 0.01))}
                pointRadius={(d: object) => Math.max(0.3, Math.min(1.5, ((d as BannedIP).weight || 1) * 0.1))} // Scale dot size based on weight
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

                // Dynamic rings radiating outwards
                ringsData={aggregatedData}
                ringColor={() => '#ef4444'}
                ringMaxRadius={(d: object) => Math.max(2, Math.min(8, Math.log10(((d as BannedIP).weight || 1) * 10)))}
                ringPropagationSpeed={0.8}
                ringRepeatPeriod={1000}

                // Rendering settings
                atmosphereColor="#0d614b" // Terminal green atmosphere glow
                atmosphereAltitude={0.15}
              />
            )}
          </div>

          {/* Zoom Controls overlay */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
            <button
              onClick={() => {
                if (globeRef.current) {
                  const r = globeRef.current.pointOfView().altitude;
                  globeRef.current.pointOfView({ altitude: Math.max(r - 0.5, 0.5) }, 400);
                }
              }}
              className="bg-black/50 hover:bg-white/10 border border-[var(--terminal-border)] rounded w-8 h-8 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              title="Zoom In"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
            <button
              onClick={() => {
                if (globeRef.current) {
                  const r = globeRef.current.pointOfView().altitude;
                  globeRef.current.pointOfView({ altitude: Math.min(r + 0.5, 3) }, 400);
                }
              }}
              className="bg-black/50 hover:bg-white/10 border border-[var(--terminal-border)] rounded w-8 h-8 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
              title="Zoom Out"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
          </div>
        </div>

        <div className="w-full lg:w-1/2 font-mono flex flex-col gap-4 z-10 h-full justify-center">
          <div className="bg-[var(--terminal-bg)] border border-[var(--terminal-border)] rounded p-4 shadow-[inset_0_0_10px_rgba(var(--terminal-accent-rgb),0.1)]">
            <p className="text-xs text-[var(--terminal-text-dim)] mb-1">TOTAL_ATTACKS_MITIGATED</p>
            <p className="text-3xl font-bold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
              {threatData ? threatData.total_banned.toLocaleString() : '-----'}
            </p>
          </div>

          <div className="text-sm border border-[var(--terminal-border)] rounded overflow-hidden">
            <div className="bg-[var(--terminal-surface-alt)] border-b border-[var(--terminal-border)] p-2 grid grid-cols-12 gap-2 text-[10px] sm:text-xs font-bold text-[var(--terminal-text-muted)]">
              <div className="col-span-5">SOURCE_IP</div>
              <div className="col-span-2 text-center">LOC</div>
              <div className="col-span-5">VECTOR</div>
            </div>
            <div className="p-2 flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar">
              {threatData?.recent_bans.map((ban, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 text-[10px] sm:text-xs items-center hover:bg-[var(--terminal-surface-hover)] p-1 rounded transition-colors group/row">
                  <div className="col-span-5 text-[#ef4444] group-hover/row:text-white transition-colors">
                    {ban.ip}
                  </div>
                  <div className="col-span-2 text-center text-white font-bold opacity-80 truncate" title={`${ban.country}`}>
                    {ban.country}
                  </div>
                  <div className="col-span-5 text-[var(--terminal-text-dim)] group-hover/row:text-[var(--terminal-accent-alt)] transition-colors truncate">
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
