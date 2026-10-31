'use client';

import { useSyncExternalStore } from 'react';
import { OPEN_PALETTE_EVENT } from './CommandPalette';

const subscribeNever = () => () => {};

/** Header hint that opens the palette. Shows ⌘K on Apple devices, Ctrl K elsewhere. */
export default function CommandPaletteButton() {
  const isApple = useSyncExternalStore(subscribeNever, () => /Mac|iPhone|iPad/.test(navigator.platform), () => false);

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
      title="Command palette"
      className="hidden md:flex items-center gap-2 h-9 px-2.5 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] hover:text-primary hover:border-primary active:scale-95 transition flex-shrink-0 font-mono text-xs"
    >
      <span className="material-symbols-outlined text-base" aria-hidden="true">search</span>
      {/* Visible text is part of the accessible name, as WCAG 2.5.3 requires. */}
      <span className="sr-only">Open command palette</span>
      <kbd>{isApple ? '⌘K' : 'Ctrl K'}</kbd>
    </button>
  );
}
