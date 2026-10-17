'use client';

import { createElement, type ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { revealDelay } from '@/lib/motion';

interface RevealProps {
  as?: 'div' | 'p' | 'li' | 'section';
  id?: string;
  className?: string;
  /** Entrance delay in ms, for staggering siblings. */
  delay?: number;
  /** Also sweep accent scan lines along the top and bottom edges (panels and cards). */
  draw?: boolean;
  children: ReactNode;
}

/** Fades and slides its content in the first time it scrolls into view. Usable from server components. */
export default function Reveal({ as = 'div', id, className = '', delay = 0, draw = false, children }: RevealProps) {
  const ref = useScrollReveal<HTMLElement>();
  const classes = `scroll-reveal ${draw ? 'panel-draw relative' : ''} ${className}`.trim();
  return createElement(as, { ref, id, className: classes, style: delay ? revealDelay(delay) : undefined, 'data-reveal': '' }, children);
}
