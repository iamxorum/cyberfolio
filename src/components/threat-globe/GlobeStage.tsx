'use client';

import dynamic from 'next/dynamic';
import type { GlobeMethods } from 'react-globe.gl';
import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react';
import GlobeSourceToggle from './GlobeSourceToggle';
import GlobeSpinToggle from './GlobeSpinToggle';
import GlobeInspectorPanel from './GlobeInspectorPanel';
import { usePrefersReducedMotion } from '@/lib/motion';
import { track } from '@/lib/track';
import {
  escapeHtml,
  GLOBE_TEXTURE_DARK,
  GLOBE_TEXTURE_LIGHT,
  getArcColor,
  getArcDashAnimateTime,
  getArcDashInitialGap,
  getArcStroke,
  globeBudget,
  getPointColor,
  getPointRadius,
  getRingColor,
  getRingMaxRadius,
  getRingRepeatPeriod,
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
  globeRef: RefObject<GlobeMethods | undefined>;
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
  isSpinning: boolean;
  onToggleSpin: () => void;
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
  isSpinning,
  onToggleSpin,
}: GlobeStageProps) {
  const size = globeSize(windowWidth);
  const budget = globeBudget(windowWidth);
  const rendererConfig = useMemo(() => ({ antialias: budget.antialias, alpha: true, powerPreference: 'high-performance' as const }), [budget.antialias]);
  const reduceMotion = usePrefersReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  // Stop the WebGL render loop while the globe is scrolled out of view; it otherwise
  // redraws every frame (auto-rotate, arc dashes, rings) for nobody.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isGlobeReady) return;
    const observer = new IntersectionObserver(([entry]) => {
      const globe = globeRef.current;
      if (!globe) return;
      if (entry.isIntersecting) globe.resumeAnimation();
      else globe.pauseAnimation();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [globeRef, isGlobeReady]);

  // Cap render resolution; the canvas is small, so high-DPI phones pay for pixels nobody can see.
  useEffect(() => {
    if (!isGlobeReady) return;
    globeRef.current?.renderer().setPixelRatio(Math.min(window.devicePixelRatio, budget.maxPixelRatio));
  }, [globeRef, isGlobeReady, budget.maxPixelRatio]);

  const handlePointClick = useCallback((point: object) => {
    const p = point as GlobePointDatum;
    if (!p.isServer) {
      onPointerDownContainer();
      track('globe_point_select', { source: p.source ?? 'unknown' });
      onSelectPoint(p);
    }
  }, [onPointerDownContainer, onSelectPoint]);

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center relative min-h-[300px] sm:min-h-[450px] xl:min-h-[550px] border border-[var(--terminal-border)]/20 rounded bg-[rgba(var(--terminal-bg-rgb),0.20)] overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-[rgba(var(--terminal-accent-rgb),0.10)] to-transparent pointer-events-none animate-panel-scan z-10"></div>

      <div
        ref={containerRef}
        className="w-full aspect-square relative max-w-[450px] xl:max-w-[550px] flex items-center justify-center"
        onPointerDown={onPointerDownContainer}
        // Lenis and the ultrawide rail would turn the wheel into page scroll; here it zooms the globe.
        data-lenis-prevent-wheel
        data-wheel-capture
      >
        {isRendering && (
          <div
            className="absolute inset-0 z-[5] pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, transparent 55%, rgba(var(--terminal-bg-rgb),0.85) 100%)' }}
          />
        )}

        {!isGlobeReady && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[rgba(var(--terminal-bg-rgb),0.40)] backdrop-blur-sm rounded-full animate-pulse text-[#ef4444] font-mono text-xs">
            <span aria-hidden="true" className="material-symbols-outlined animate-spin mb-2">satellite_alt</span>
            RENDERING_GLOBE...
          </div>
        )}

        {isRendering && hasGlobeData && (
          <>
            <Globe
              ref={globeRef}
              onGlobeReady={onGlobeReady}
              width={size}
              height={size}
              globeImageUrl={isLight ? GLOBE_TEXTURE_LIGHT : GLOBE_TEXTURE_DARK}
              backgroundColor="rgba(0,0,0,0)"
              rendererConfig={rendererConfig}

              pointsData={visiblePointsData}
              pointAltitude={0.01}
              pointResolution={budget.pointResolution}
              pointRadius={getPointRadius}
              pointsTransitionDuration={reduceMotion ? 0 : 600}
              pointColor={getPointColor}
              pointLabel={pointTooltip}
              onPointClick={handlePointClick}

              ringsData={reduceMotion ? [] : visibleRingsData}
              ringColor={getRingColor}
              ringMaxRadius={getRingMaxRadius}
              ringRepeatPeriod={getRingRepeatPeriod}
              ringPropagationSpeed={0.8}

              arcsData={reduceMotion ? [] : visibleArcsData}
              arcColor={getArcColor}
              arcStroke={getArcStroke}
              arcDashLength={0.4}
              arcDashGap={0.5}
              arcDashInitialGap={getArcDashInitialGap}
              arcDashAnimateTime={getArcDashAnimateTime}
              arcAltitudeAutoScale={0.5}
              arcCurveResolution={20}
              arcCircularResolution={4}
              arcsTransitionDuration={0}

              atmosphereColor={atmosphereColor}
              atmosphereAltitude={0.1}
            />

            <GlobeSourceToggle visibleSources={visibleSources} onToggle={onToggleSource} />
            <GlobeSpinToggle isSpinning={isSpinning} onToggle={onToggleSpin} />

            {panelPoint && (
              <GlobeInspectorPanel panelPoint={panelPoint} visible={!!selectedPoint} onClose={() => onSelectPoint(null)} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
