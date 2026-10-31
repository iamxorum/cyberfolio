'use client';

import { useEffect, useState } from 'react';
import { useInViewOnce } from '@/hooks/useInViewOnce';
import { usePrefersReducedMotion } from '@/lib/motion';

const CHAR_MS = 28;
const CURSOR_LINGER_MS = 2000;

// One of these is typed out each visit. Add, remove or reword freely.
const TAGLINES = [
  'You scrolled all the way down here. Respect.',
  "That's the whole site. No hidden menu, I checked.",
  'Once fueled by Monster, curiosity and a suspicious number of firewall rules.',
  'If you made it this far, we should probably talk. Contact Me!',
  'Still here? The honeypot is more exciting than this footer.',
  'No bugs were harmed in the making of this site. Several were caught.',
  'Thanks for stopping by. Go touch some grass, then come back.',
];

/** A single witty sign-off that types itself once when the footer scrolls into view. Decorative only. */
export default function FooterTagline() {
  const [ref, inView] = useInViewOnce<HTMLParagraphElement>('0px');
  const reduceMotion = usePrefersReducedMotion();
  const [shown, setShown] = useState('');
  const [cursorDone, setCursorDone] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const text = TAGLINES[Math.floor(Math.random() * TAGLINES.length)];
    // Reduced motion lands the whole line on the first tick instead of typing it.
    const step = reduceMotion ? text.length : 1;
    let count = 0;
    const interval = setInterval(() => {
      count = Math.min(count + step, text.length);
      setShown(text.slice(0, count));
      if (count >= text.length) clearInterval(interval);
    }, CHAR_MS);
    const hideTimer = setTimeout(() => setCursorDone(true), text.length * CHAR_MS + CURSOR_LINGER_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(hideTimer);
    };
  }, [inView, reduceMotion]);

  return (
    // Height is reserved (two lines on phones) so typing never pushes the footer around.
    <p ref={ref} aria-hidden="true" className="min-h-[2.75rem] sm:min-h-[1.5rem] font-mono text-xs sm:text-xs text-[var(--terminal-text-dim)] leading-relaxed">
      {shown}
      {inView && !cursorDone && <span className="blinking-cursor text-primary" />}
    </p>
  );
}
