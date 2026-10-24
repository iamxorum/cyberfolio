'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ACCENTS, ACCENT_DOT, getAccent, setAccent, type Accent } from '@/lib/accent';
import { track } from '@/lib/track';

// Read from <html data-accent>, which the layout script sets before hydration.
function subscribeToAccent(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-accent'] });
  return () => observer.disconnect();
}

const dotStyle = (accent: Accent) => ({ backgroundColor: ACCENT_DOT[accent], boxShadow: `0 0 8px ${ACCENT_DOT[accent]}` });

export default function AccentToggle() {
  const accent = useSyncExternalStore(subscribeToAccent, getAccent, () => 'default' as const);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape or an outside click.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  const choose = (next: Accent) => {
    setAccent(next);
    track('accent_change', { to: next });
    setOpen(false);
    buttonRef.current?.focus();
  };

  // On phones the wrapper is static so the picker spans the header; from sm up it sits under the button.
  return (
    <div ref={wrapperRef} className="static sm:relative flex-shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Accent colour: ${accent}. Change`}
        aria-expanded={open}
        aria-controls="accent-picker"
        title={`Accent colour: ${accent}`}
        className="flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] hover:text-primary hover:border-primary active:scale-95 transition"
      >
        <span aria-hidden="true" className="block w-3.5 h-3.5 rounded-full" style={dotStyle(accent)} />
      </button>
      <div
        id="accent-picker"
        role="group"
        aria-label="Accent colour"
        inert={!open}
        className={`absolute inset-x-3 top-full mt-2 z-[60] grid grid-cols-5 justify-items-center gap-2 sm:inset-x-auto sm:right-0 sm:w-max rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] p-3 shadow-[0_12px_24px_rgba(0,0,0,0.35)] transition-[opacity,transform,visibility] duration-150 ease-[var(--ease-out)] origin-top-right ${
          open ? 'visible opacity-100 scale-100' : 'invisible opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {ACCENTS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => choose(option)}
            aria-pressed={accent === option}
            aria-label={option}
            title={option}
            className={`flex h-8 w-8 items-center justify-center rounded-full border transition active:scale-90 ${
              accent === option ? 'border-primary' : 'border-[var(--terminal-border)] hover:border-primary'
            }`}
          >
            <span aria-hidden="true" className="block h-4 w-4 rounded-full" style={dotStyle(option)} />
          </button>
        ))}
      </div>
    </div>
  );
}
