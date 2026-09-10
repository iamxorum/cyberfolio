import Image from 'next/image';
import type { GlobePointDatum } from '@/lib/threat-globe';

interface GlobeInspectorPanelProps {
  panelPoint: GlobePointDatum;
  visible: boolean;
  onClose: () => void;
}

export default function GlobeInspectorPanel({ panelPoint, visible, onClose }: GlobeInspectorPanelProps) {
  return (
    <div
      className="absolute top-2 right-2 z-20 flex flex-col gap-1 font-mono text-[10px] bg-[rgba(var(--terminal-bg-rgb),0.85)] p-2.5 rounded border border-[var(--terminal-border)] backdrop-blur-sm max-w-[180px]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.95)',
        pointerEvents: visible ? 'auto' : 'none',
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
          onClick={onClose}
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
  );
}
