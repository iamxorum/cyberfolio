'use client';

import { useMemo, useState } from 'react';
import { formatRelativeTime } from '@/lib/format-time';
import { computeThreatGeometry } from '@/lib/threat-globe';
import { useThreatFeed } from '@/hooks/useThreatFeed';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { useThemeSync } from '@/hooks/useThemeSync';
import { useGlobePanel } from '@/hooks/useGlobePanel';
import { useBanReveal } from '@/hooks/useBanReveal';
import { useGlobeCamera } from '@/hooks/useGlobeCamera';
import ThreatFeedUnavailable from '@/components/threat-globe/ThreatFeedUnavailable';
import GlobeStage from '@/components/threat-globe/GlobeStage';
import TotalMitigatedCard from '@/components/threat-globe/TotalMitigatedCard';
import CountryLeaderboard from '@/components/threat-globe/CountryLeaderboard';
import LiveBanTicker from '@/components/threat-globe/LiveBanTicker';

const MAX_ANIMATED_ARCS = 40;
const MAX_ANIMATED_RINGS = 50;

export default function ThreatGlobe() {
  const { threatData, hasError, isRendering } = useThreatFeed();
  const windowWidth = useWindowWidth();
  const { atmosphereColor, isLight } = useThemeSync();
  const { selectedPoint, setSelectedPoint, panelPoint } = useGlobePanel();
  const [isGlobeReady, setIsGlobeReady] = useState(false);
  const [visibleSources, setVisibleSources] = useState({ local: true, public: true });

  const { banPoints, serverNodes, arcsData, countryLeaderboard, ringsData } = useMemo(
    () => computeThreatGeometry(threatData),
    [threatData]
  );

  const { globeRef, selectedCountry, flyToCountry, lastInteractionRef } = useGlobeCamera({
    isGlobeReady,
    countryLeaderboard,
    clearSelectedPoint: () => setSelectedPoint(null),
  });

  const { revealedBanPoints, revealedKeySet } = useBanReveal(isGlobeReady, banPoints);

  const visiblePointsData = useMemo(
    () => [...revealedBanPoints.filter((p) => visibleSources[p.source]), ...serverNodes],
    [revealedBanPoints, serverNodes, visibleSources]
  );
  const visibleArcsData = useMemo(
    () => arcsData
      .filter((a) => visibleSources[a.source] && revealedKeySet.has(`${a.startLat},${a.startLng},${a.source}`))
      .slice(0, MAX_ANIMATED_ARCS),
    [arcsData, visibleSources, revealedKeySet]
  );
  const visibleRingsData = useMemo(
    () => ringsData
      .filter((r) => visibleSources[r.source] && revealedKeySet.has(`${r.lat},${r.lng},${r.source}`))
      .slice(0, MAX_ANIMATED_RINGS),
    [ringsData, visibleSources, revealedKeySet]
  );

  const markInteraction = () => { lastInteractionRef.current = Date.now(); };
  const toggleSource = (source: 'local' | 'public') =>
    setVisibleSources((v) => ({ ...v, [source]: !v[source] }));

  if (hasError || !threatData) {
    return <ThreatFeedUnavailable />;
  }

  return (
    <div id="threat-feed" className="scroll-mt-20 flex flex-col gap-6 px-3 sm:px-5 py-6 sm:py-8 mb-8 border border-[var(--terminal-border)] rounded bg-[rgba(var(--terminal-bg-rgb),0.60)] relative overflow-hidden group">
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
        <GlobeStage
          globeRef={globeRef}
          windowWidth={windowWidth}
          isLight={isLight}
          isRendering={isRendering}
          isGlobeReady={isGlobeReady}
          onGlobeReady={() => setIsGlobeReady(true)}
          hasGlobeData={banPoints.length > 0 || serverNodes.length > 0}
          visiblePointsData={visiblePointsData}
          visibleRingsData={visibleRingsData}
          visibleArcsData={visibleArcsData}
          atmosphereColor={atmosphereColor}
          onPointerDownContainer={markInteraction}
          selectedPoint={selectedPoint}
          onSelectPoint={setSelectedPoint}
          panelPoint={panelPoint}
          visibleSources={visibleSources}
          onToggleSource={toggleSource}
        />

        {/* RIGHT COLUMN: STATS */}
        <div className="w-full lg:w-1/2 font-mono flex flex-col gap-4 flex-1">
          <TotalMitigatedCard totalBanned={threatData?.total_banned || 0} />
          <CountryLeaderboard
            entries={countryLeaderboard}
            selectedCountry={selectedCountry}
            isGlobeReady={isGlobeReady}
            onSelect={flyToCountry}
          />
          <LiveBanTicker entries={banPoints} />
        </div>
      </div>
    </div>
  );
}
