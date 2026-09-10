import { useEffect, useRef, useState } from 'react';
import type { GlobePointDatum } from '@/lib/threat-globe';

export function useGlobePanel() {
  const [selectedPoint, setSelectedPoint] = useState<GlobePointDatum | null>(null);
  const [panelPoint, setPanelPoint] = useState<GlobePointDatum | null>(null);
  const panelClearTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (selectedPoint) {
      if (panelClearTimeout.current) clearTimeout(panelClearTimeout.current);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPanelPoint(selectedPoint);
    } else {
      panelClearTimeout.current = setTimeout(() => setPanelPoint(null), 200);
    }
    return () => {
      if (panelClearTimeout.current) clearTimeout(panelClearTimeout.current);
    };
  }, [selectedPoint]);

  return { selectedPoint, setSelectedPoint, panelPoint };
}
