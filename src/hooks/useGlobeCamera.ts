import { useCallback, useEffect, useRef, useState } from 'react';
import { dcConfig } from '@/config';
import { prefersReducedMotion } from '@/lib/motion';
import type { CountryLeaderboardEntry } from '@/lib/threat-globe';

const SPOTLIGHT_INTERVAL_MS = 15000;

interface UseGlobeCameraOptions {
  isGlobeReady: boolean;
  countryLeaderboard: CountryLeaderboardEntry[];
  clearSelectedPoint: () => void;
}

export function useGlobeCamera({ isGlobeReady, countryLeaderboard, clearSelectedPoint }: UseGlobeCameraOptions) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globeRef = useRef<any>(null);
  const resumeRotateTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteractionRef = useRef(0);
  const spotlightIndexRef = useRef(0);

  useEffect(() => {
    lastInteractionRef.current = Date.now();
    return () => {
      if (resumeRotateTimeout.current) clearTimeout(resumeRotateTimeout.current);
    };
  }, []);

  const flyToCountry = useCallback((item: { country: string; lat: number; lng: number }) => {
    if (!globeRef.current) return;
    clearSelectedPoint();
    const controls = globeRef.current.controls();
    controls.autoRotate = false;
    setSelectedCountry(item.country);
    globeRef.current.pointOfView({ lat: item.lat, lng: item.lng, altitude: 1.4 }, 1200);

    if (resumeRotateTimeout.current) clearTimeout(resumeRotateTimeout.current);
    resumeRotateTimeout.current = setTimeout(() => {
      if (globeRef.current) globeRef.current.controls().autoRotate = !prefersReducedMotion();
      setSelectedCountry(null);
    }, 5000);
  }, [clearSelectedPoint]);

  // Initial camera setup once the globe mesh is ready.
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

  // Ambient auto-tour of the top 3 threat countries when nobody has touched the globe recently.
  useEffect(() => {
    if (!isGlobeReady || prefersReducedMotion() || countryLeaderboard.length === 0) return;
    const top3 = countryLeaderboard.slice(0, 3);
    const interval = setInterval(() => {
      if (Date.now() - lastInteractionRef.current < SPOTLIGHT_INTERVAL_MS) return;
      const next = top3[spotlightIndexRef.current % top3.length];
      spotlightIndexRef.current += 1;
      flyToCountry(next);
    }, SPOTLIGHT_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isGlobeReady, countryLeaderboard, flyToCountry]);

  return { globeRef, selectedCountry, flyToCountry, lastInteractionRef };
}
