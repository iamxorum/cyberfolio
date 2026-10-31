'use client';

import { useEffect, useEffectEvent, useRef, useState } from 'react';

/**
 * A post image that opens full size in a modal on click; its alt text doubles as the visible caption.
 * With more images in the post, arrow keys (or the side buttons) step through them without closing.
 */
export default function ZoomImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  // Closing hands focus back to the image, which would draw the focus ring around it until the next click or Tab.
  const [justClosed, setJustClosed] = useState(false);
  const [position, setPosition] = useState({ index: 0, total: 1 });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const openZoom = () => {
    const all = [...document.querySelectorAll<HTMLElement>('[data-zoom-button]')];
    setPosition({ index: Math.max(0, all.indexOf(buttonRef.current as HTMLElement)), total: all.length });
    setOpen(true);
  };

  // Opens the neighbouring image's own modal, then closes this one, so the backdrop never flashes.
  const step = (direction: 1 | -1) => {
    const all = [...document.querySelectorAll<HTMLElement>('[data-zoom-button]')];
    const neighbour = all[position.index + direction];
    if (!neighbour) return;
    neighbour.scrollIntoView({ block: 'center' });
    neighbour.click();
    dialogRef.current?.close();
  };
  // Always sees the current position, without the listeners below being re-attached on every step.
  const onArrowKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
    else return;
    e.preventDefault();
  });

  // The native dialog brings the focus trap, Escape to close and the backdrop; it is only mounted while open.
  // A click outside the side buttons closes it (the backdrop is part of the dialog), and the arrow keys step.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog) return;
    if (!dialog.open) dialog.showModal();

    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest('button')) dialog.close();
    };
    const onKeyDown = (e: KeyboardEvent) => onArrowKey(e);
    dialog.addEventListener('click', onClick);
    dialog.addEventListener('keydown', onKeyDown);
    return () => {
      dialog.removeEventListener('click', onClick);
      dialog.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <figure data-reveal className="scroll-reveal my-4 flex flex-col gap-2">
      <button
        ref={buttonRef}
        data-zoom-button
        type="button"
        onClick={openZoom}
        onBlur={() => setJustClosed(false)}
        style={justClosed ? { outline: 'none' } : undefined}
        aria-label={alt ? `Enlarge image: ${alt}` : 'Enlarge image'}
        className="print-keep block w-full cursor-zoom-in rounded border border-[var(--terminal-border)] transition-[border-color,transform] duration-150 hover:border-primary active:scale-[0.99]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- MDX content images have no known dimensions for next/image */}
        <img src={src} alt={alt} loading="lazy" className="w-full rounded" />
      </button>
      {alt && <figcaption aria-hidden="true" className="font-mono text-xs leading-relaxed text-[var(--terminal-text-dim)]">{alt}</figcaption>}
      {open && (
        <dialog
          ref={dialogRef}
          onClose={() => { setOpen(false); setJustClosed(true); }}
          aria-label={alt || 'Image'}
          className="animate-fade-in-fast m-auto max-h-[94vh] max-w-[96vw] cursor-zoom-out overflow-hidden bg-transparent p-0 backdrop:bg-black/85 backdrop:backdrop-blur-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
          <img src={src} alt={alt} className="max-h-[94vh] max-w-[96vw] rounded object-contain" />
          {position.total > 1 && (
            <>
              {(['prev', 'next'] as const).map((side) => {
                const direction = side === 'prev' ? -1 : 1;
                const disabled = position.index + direction < 0 || position.index + direction >= position.total;
                return (
                  <button
                    key={side}
                    type="button"
                    onClick={() => step(direction)}
                    disabled={disabled}
                    aria-label={side === 'prev' ? 'Previous image' : 'Next image'}
                    className={`absolute top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white transition-[opacity,transform] duration-150 hover:bg-black/80 active:scale-90 disabled:pointer-events-none disabled:opacity-0 ${side === 'prev' ? 'left-3' : 'right-3'}`}
                  >
                    <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={side === 'prev' ? 'M10 3 5 8l5 5' : 'M6 3l5 5-5 5'} /></svg>
                  </button>
                );
              })}
              <span aria-hidden="true" className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded bg-black/60 px-2 py-1 font-mono text-xs tabular-nums text-white">{position.index + 1} / {position.total}</span>
            </>
          )}
        </dialog>
      )}
    </figure>
  );
}
