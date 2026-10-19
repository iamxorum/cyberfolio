'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

// A4 at 96dpi, with the same 0.5in margin the print stylesheet uses.
const PAGE_W = 794;
const PAGE_H = 1123;
const MARGIN = 48;
const CONTENT_W = PAGE_W - MARGIN * 2;
const CONTENT_H = PAGE_H - MARGIN * 2;
const MIN_PAGE_FILL = 80;
const MAX_ZOOM = 1.25;

const BLOCK_DISPLAYS = new Set(['block', 'flex', 'list-item']);

// Y offsets (px from the top of `root`) where a page may end without slicing through a line,
// an entry or a section header: the top of any block child of a block parent.
function breakCandidates(root: HTMLElement): number[] {
  const rootTop = root.getBoundingClientRect().top;
  const tops = new Set<number>();
  root.querySelectorAll<HTMLElement>('*').forEach((el) => {
    const parent = el.parentElement;
    if (!parent || getComputedStyle(parent).display !== 'block') return;
    if (!BLOCK_DISPLAYS.has(getComputedStyle(el).display)) return;
    // Keep a heading (or a short title block) with whatever follows it.
    const prev = el.previousElementSibling;
    if (prev && prev.getBoundingClientRect().height < 60 && (/^H[1-6]$/.test(prev.tagName) || prev.querySelector('h1,h2,h3,h4'))) return;
    tops.add(Math.round(el.getBoundingClientRect().top - rootTop));
  });
  return [...tops].sort((a, b) => a - b);
}

function computeBreaks(root: HTMLElement): number[] {
  const total = Math.ceil(root.getBoundingClientRect().height);
  const candidates = breakCandidates(root);
  const breaks = [0];
  let start = 0;
  while (total - start > CONTENT_H) {
    const limit = start + CONTENT_H;
    let end = limit; // no clean break available: slice at the page edge
    for (const top of candidates) {
      if (top > limit) break;
      if (top > start + MIN_PAGE_FILL) end = top;
    }
    breaks.push(end);
    start = end;
  }
  breaks.push(total);
  return breaks;
}

interface PagedPreviewProps {
  children: ReactNode;
  /** Shown beside the page counter, e.g. "CV". */
  label: string;
}

/**
 * Previews a document one A4 page at a time, scaled to fit the available height, with next/back
 * controls. The content is rendered twice: once invisibly at page width to find clean page breaks,
 * and once per visible page, clipped to that page's slice.
 */
export default function PagedPreview({ children, label }: PagedPreviewProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [breaks, setBreaks] = useState<number[]>([0, CONTENT_H]);
  const [page, setPage] = useState(0);
  const [zoom, setZoom] = useState(1);

  const pageCount = breaks.length - 1;
  const current = Math.min(page, pageCount - 1);

  const remeasure = useCallback(() => {
    const root = measureRef.current;
    if (!root) return;
    const next = computeBreaks(root);
    setBreaks((prev) => (prev.length === next.length && prev.every((b, i) => b === next[i]) ? prev : next));
  }, []);

  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    remeasure();
    const observer = new ResizeObserver(remeasure);
    observer.observe(root);
    // Webfonts shift line heights once loaded.
    document.fonts?.ready.then(remeasure);
    return () => observer.disconnect();
  }, [remeasure]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const fit = () => {
      const { clientWidth, clientHeight } = stage;
      if (clientWidth === 0 || clientHeight === 0) return;
      setZoom(Math.min(MAX_ZOOM, clientWidth / PAGE_W, clientHeight / PAGE_H));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const go = useCallback((delta: number) => {
    setPage((p) => Math.max(0, Math.min(pageCount - 1, Math.min(p, pageCount - 1) + delta)));
  }, [pageCount]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'PageDown') go(1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') go(-1);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [go]);

  const start = breaks[current];
  const sliceHeight = breaks[current + 1] - start;

  const navButton = 'flex h-10 w-10 cursor-pointer items-center justify-center rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] text-[var(--terminal-text)] transition hover:border-primary hover:text-primary active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-[var(--terminal-border)] disabled:hover:text-[var(--terminal-text)]';

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div ref={stageRef} className="relative min-h-0 flex-1">
        <div
          className="absolute left-1/2 top-1/2 bg-white shadow-[0_0_40px_rgba(0,0,0,0.5)]"
          style={{ width: PAGE_W, height: PAGE_H, transform: `translate(-50%, -50%) scale(${zoom})` }}
        >
          <div className="absolute overflow-hidden" style={{ left: MARGIN, top: MARGIN, width: CONTENT_W, height: sliceHeight }}>
            <div style={{ width: CONTENT_W, transform: `translateY(${-start}px)` }}>{children}</div>
          </div>
        </div>
      </div>

      {/* Invisible copy at page width, only used to find the page breaks. */}
      <div aria-hidden="true" inert className="pointer-events-none fixed -left-[9999px] top-0 invisible" style={{ width: CONTENT_W }}>
        <div ref={measureRef}>{children}</div>
      </div>

      <div className="flex items-center justify-center gap-4 font-mono text-sm text-[var(--terminal-text-muted)]">
        <button type="button" className={navButton} onClick={() => go(-1)} disabled={current === 0} aria-label={`Previous ${label} page`}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span aria-live="polite" className="min-w-32 text-center tracking-widest">
          {label} · PAGE {current + 1} / {pageCount}
        </span>
        <button type="button" className={navButton} onClick={() => go(1)} disabled={current >= pageCount - 1} aria-label={`Next ${label} page`}>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
