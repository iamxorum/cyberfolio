'use client';

import { useEffect, useRef } from 'react';
import { eventProps } from '@/lib/track';

const SECTIONS = [
  { href: '#bio', label: 'BIO' },
  { href: '#skills', label: 'SKILLS' },
  { href: '#interests', label: 'INTERESTS' },
  { href: '#experience', label: 'EXPERIENCE' },
  { href: '#education', label: 'EDUCATION' },
  { href: '#certifications', label: 'CERTS' },
];

// A section counts as "current" while it spans this line, measured from the top of the
// viewport (just under the sticky header + this bar).
const ACTIVE_LINE_PX = 130;

const CHIP_BASE = 'px-2 py-1 rounded border active:scale-95 transition';
const CHIP_IDLE = 'border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary';
const CHIP_ACTIVE = 'border-primary text-primary bg-primary/10';

export default function QuickNav() {
  const navRef = useRef<HTMLElement>(null);

  // Highlights the chip of the section currently under the active line. Class and
  // aria-current are toggled directly on the DOM, so scrolling never re-renders React.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const chips = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const targets = chips.map((chip) => document.getElementById(chip.getAttribute('href')!.slice(1)));

    let frame = 0;
    const update = () => {
      frame = 0;
      // On two-column layouts several sections span the line: prefer the one entered last.
      let activeIndex = -1;
      let activeTop = -Infinity;
      targets.forEach((target, i) => {
        if (!target) return;
        const { top, bottom } = target.getBoundingClientRect();
        if (top <= ACTIVE_LINE_PX && bottom > ACTIVE_LINE_PX && top > activeTop) {
          activeIndex = i;
          activeTop = top;
        }
      });
      chips.forEach((chip, i) => {
        const isActive = i === activeIndex;
        chip.className = `${CHIP_BASE} ${isActive ? CHIP_ACTIVE : CHIP_IDLE}`;
        if (isActive) chip.setAttribute('aria-current', 'location');
        else chip.removeAttribute('aria-current');
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <nav
      ref={navRef}
      aria-label="Section jump links"
      className="sticky top-[var(--header-h,60px)] z-40 -mx-1 px-1 py-2 bg-[var(--terminal-bg)]/95 backdrop-blur-sm flex flex-wrap gap-2 text-xs sm:text-xs font-mono"
    >
      {SECTIONS.map((item) => (
        <a key={item.href} href={item.href} {...eventProps('about_nav_click', { section: item.label })} className={`${CHIP_BASE} ${CHIP_IDLE}`}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
