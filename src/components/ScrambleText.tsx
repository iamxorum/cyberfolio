'use client';

import { useEffect, useState } from 'react';
import { prefersReducedMotion, whenBootDone } from '@/lib/motion';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+<>?';
const FRAME_MS = 45;
const LOCK_FRAMES_PER_CHAR = 2;
const SCRAMBLE_LEAD_FRAMES = 6;

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
const isScramblable = (ch: string) => /[A-Za-z0-9]/.test(ch);

/**
 * Decrypts `text` left to right out of random glyphs once the boot screen is gone. Punctuation and
 * spaces stay put, so a monospace line never changes width. Server HTML and assistive tech get the real text.
 */
export default function ScrambleText({ text }: { text: string }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    let interval: ReturnType<typeof setInterval> | undefined;

    const cancelBoot = whenBootDone(() => {
      let frame = 0;
      interval = setInterval(() => {
        frame += 1;
        const locked = Math.floor((frame - SCRAMBLE_LEAD_FRAMES) / LOCK_FRAMES_PER_CHAR);
        setDisplay(
          Array.from(text, (ch, i) => (!isScramblable(ch) || i < locked ? ch : randomGlyph())).join(''),
        );
        if (locked >= text.length) {
          clearInterval(interval);
          setDisplay(text);
        }
      }, FRAME_MS);
    });

    return () => {
      cancelBoot();
      if (interval) clearInterval(interval);
    };
  }, [text]);

  return (
    <span>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{display}</span>
    </span>
  );
}
