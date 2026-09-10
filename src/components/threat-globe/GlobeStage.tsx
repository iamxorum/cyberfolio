'use client';

import dynamic from 'next/dynamic';
import type { RefObject } from 'react';
import GlobeSourceToggle from './GlobeSourceToggle';
import GlobeInspectorPanel from './GlobeInspectorPanel';
import {
  escapeHtml,
  getArcStroke,
  getPointColor,
  getPointRadius,
  getRingColor,
  type GlobeArcDatum,
  type GlobePointDatum,
  type GlobeRingDatum,
} from '@/lib/threat-globe';

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

function globeSize(windowWidth: number) {
  if (windowWidth < 640) return windowWidth - 80;
  if (windowWidth < 1024) return 350;
  if (windowWidth < 1280) return 400;
  return 500;
}

function pointTooltip(obj: object) {
  const p = obj as GlobePointDatum;
  if (p.isServer) {
    const name = p.name ? ` &middot; ${escapeHtml(p.name)}` : '';
    return `<div class="globe-tooltip">${escapeHtml(p.id ?? 'Node')}${name}</div>`;
  }
  if (!p.country) return '';
  const city = p.city ? ` &middot; ${escapeHtml(p.city)}` : '';
  return `<div class="globe-tooltip">${escapeHtml(p.country)}${city}</div>`;
}

interface VisibleSources {
  local: boolean;
  public: boolean;
}

interface GlobeStageProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  globeRef: RefObject<any>;
  windowWidth: number;
  isLight: boolean;
  isRendering: boolean;
  isGlobeReady: boolean;
  onGlobeReady: () => void;
  hasGlobeData: boolean;
  visiblePointsData: GlobePointDatum[];
  visibleRingsData: GlobeRingDatum[];
  visibleArcsData: GlobeArcDatum[];
  atmosphereColor: string;
  onPointerDownContainer: () => void;
  selectedPoint: GlobePointDatum | null;
  onSelectPoint: (point: GlobePointDatum | null) => void;
  panelPoint: GlobePointDatum | null;
  visibleSources: VisibleSources;
  onToggleSource: (source: keyof VisibleSources) => void;
}

export default function GlobeStage({
  globeRef,
  windowWidth,
  isLight,
  isRendering,
  isGlobeReady,
  onGlobeReady,
  hasGlobeData,
  visiblePointsData,
  visibleRingsData,
  visibleArcsData,
  atmosphereColor,
  onPointerDownContainer,
  selectedPoint,
  onSelectPoint,
  panelPoint,
  visibleSources,
  onToggleSource,
}: GlobeStageProps) {
  const size = globeSize(windowWidth);

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[300px] sm:min-h-[450px] xl:min-h-[550px] border border-[var(--terminal-border)]/20 rounded bg-[rgba(var(--terminal-bg-rgb),0.20)] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-[rgba(var(--terminal-accent-rgb),0.10)] to-transparent pointer-events-none animate-panel-scan z-10"></div>

      <div
        className="w-full aspect-square relative max-w-[450px] xl:max-w-[550px] flex items-center justify-center"
        onPointerDown={onPointerDownContainer}
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

        {isRendering && typeof window !== 'undefined' && hasGlobeData && (
          <>
            <Globe
              ref={globeRef}
              onGlobeReady={onGlobeReady}
              width={size}
              height={size}
              globeImageUrl={isLight ? 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg' : 'https://unpkg.com/three-globe/example/img/earth-dark.jpg'}
              backgroundColor="rgba(0,0,0,0)"

              pointsData={visiblePointsData}
              pointAltitude={0.01}
              pointRadius={getPointRadius}
              pointsTransitionDuration={600}
              pointColor={getPointColor}
              pointLabel={pointTooltip}
              onPointClick={(point: object) => {
                const p = point as GlobePointDatum;
                if (!p.isServer) {
                  onPointerDownContainer();
                  onSelectPoint(p);
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

            <GlobeSourceToggle visibleSources={visibleSources} onToggle={onToggleSource} />

            {panelPoint && (
              <GlobeInspectorPanel panelPoint={panelPoint} visible={!!selectedPoint} onClose={() => onSelectPoint(null)} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
