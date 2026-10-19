'use client';

import { useCallback, useState, type CSSProperties } from 'react';
import { badges, features, type BadgeConfig } from '@/config';
import { eventProps } from '@/lib/track';

const IMAGE_HEIGHT_PX = 24;

// Static badge drawn locally (same flat look as the shields.io ones), so it never depends on a remote service.
function BadgePill({ pill, accent }: { pill: NonNullable<BadgeConfig['pill']>; accent: string }) {
  return (
    <div className="flex overflow-hidden rounded-[4px] ring-1 ring-black/15 font-mono text-[11px] font-bold leading-none text-white" style={{ height: IMAGE_HEIGHT_PX }}>
      <span className="flex items-center px-2 bg-[#161b22]">{pill.label}</span>
      <span className="flex items-center px-2" style={{ backgroundColor: `color-mix(in srgb, ${accent} 78%, black)` }}>{pill.value}</span>
    </div>
  );
}

// Badge art comes from third-party hosts, so it can be slow or fail. The slot is reserved up front
// (fixed height, width from `aspect`) so the card never jumps, with a static skeleton behind the image
// and a quiet fallback on error. The image itself is never hidden or faded: it simply paints when ready.
function BadgeImage({ badge }: { badge: BadgeConfig }) {
  const [failed, setFailed] = useState(false);

  // An image served from cache can fail before React attaches onError, so check on mount too.
  const imgRef = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  const slotStyle: CSSProperties = {
    height: IMAGE_HEIGHT_PX,
    // Some SVGs (AbuseIPDB) have no intrinsic width and would stretch to the default 300px, so a known
    // aspect pins the slot to exactly the image's shape; without one the slot follows the image.
    ...(badge.aspect ? { width: Math.round(IMAGE_HEIGHT_PX * badge.aspect) } : { minWidth: 48 }),
  };

  return (
    <div className="relative overflow-hidden rounded-[4px] ring-1 ring-black/15 bg-[var(--terminal-surface-dark)]" style={slotStyle}>
      {failed ? (
        <div className="flex h-full items-center px-2 font-mono text-[9px] text-[var(--terminal-text-dim)]">
          badge unavailable
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- remote SVG badges; next/image can't size or optimise them
        <img
          ref={imgRef}
          src={badge.imageUrl}
          alt={badge.name}
          fetchPriority="high"
          onError={() => setFailed(true)}
          className={`relative block h-full ${badge.aspect ? 'w-full' : 'w-auto'} max-w-none`}
          style={badge.imageStyle}
        />
      )}
    </div>
  );
}

export default function TrustBadges() {
  if (!features.badges || badges.length === 0) return null;

  return (
    <div className="mt-6 z-10">
      <div className="text-[var(--terminal-text-dim)] font-mono text-[10px] sm:text-xs mb-2.5">
        badges
      </div>
      <div className="flex flex-wrap gap-2.5 sm:gap-3">
        {badges.map((badge) => {
          const accent = badge.accent ? `#${badge.accent}` : 'var(--terminal-accent)';
          const isInternal = badge.url.startsWith('#') || badge.url.startsWith('/#');
          return (
            <a
              key={badge.id}
              href={badge.url}
              {...eventProps('badge_click', { badge: badge.id })}
              {...(!isInternal && { target: '_blank', rel: 'noopener noreferrer' })}
              className="group/badge relative flex items-center gap-2.5 rounded border px-3 py-2 overflow-hidden transition hover:-translate-y-[2px] active:scale-[0.98]"
              // Tinted from theme tokens (not fixed dark colours) so the card reads correctly in light and dark.
              style={{
                '--badge-accent': accent,
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--badge-accent) 14%, var(--terminal-surface)), var(--terminal-bg))',
                borderColor: 'color-mix(in srgb, var(--badge-accent) 30%, var(--terminal-border))',
              } as CSSProperties}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none"
                style={{ boxShadow: `inset 0 0 0 1px var(--badge-accent), 0 0 16px -2px var(--badge-accent)` }}
              ></div>

              {badge.icon && (
                <span
                  className="material-symbols-outlined text-lg flex-shrink-0 relative z-10"
                  style={{ color: 'color-mix(in srgb, var(--badge-accent) 65%, var(--terminal-text))' }}
                >
                  {badge.icon}
                </span>
              )}

              <div className="flex flex-col gap-1 min-w-0 relative z-10">
                <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-[var(--terminal-text-dim)] truncate">
                  {badge.name}
                </span>
                {badge.pill ? <BadgePill pill={badge.pill} accent={accent} /> : <BadgeImage badge={badge} />}
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
