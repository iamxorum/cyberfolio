'use client';

import { useEffect, useState } from 'react';
import { getAccent, setAccent } from '@/lib/accent';
import { prefersReducedMotion } from '@/lib/motion';
import { track } from '@/lib/track';

const SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const NOTICE_MS = 2800;

/** Easter egg: the Konami code toggles the secret `matrix` accent. Renders only the confirmation line. */
export default function KonamiCode() {
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let progress = 0;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      progress = key === SEQUENCE[progress] ? progress + 1 : key === SEQUENCE[0] ? 1 : 0;
      if (progress < SEQUENCE.length) return;
      progress = 0;

      const unlock = getAccent() !== 'matrix';
      const apply = () => setAccent(unlock ? 'matrix' : 'default');
      if (prefersReducedMotion() || typeof document.startViewTransition !== 'function') apply();
      else document.startViewTransition(apply);
      track('konami_code', { to: unlock ? 'matrix' : 'default' });
      setNotice(unlock ? 'ACCESS_GRANTED: MATRIX ACCENT UNLOCKED' : 'MATRIX ACCENT DISABLED');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(timer);
  }, [notice]);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-[90] flex justify-center px-4">
      {notice && (
        <p className="animate-fade-in-fast rounded border border-primary bg-[var(--terminal-bg)] px-4 py-2 font-mono text-xs text-primary shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.4)]">
          {notice}
        </p>
      )}
    </div>
  );
}
