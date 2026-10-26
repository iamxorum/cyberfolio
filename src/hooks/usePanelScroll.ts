import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

const LERP_PER_FRAME = 0.12;
const WHEEL_MULTIPLIER = 0.9;
const LINE_HEIGHT_PX = 32;
const SETTLED_PX = 0.5;
const JUMP_CLEARANCE_PX = 8;

/**
 * Smooth wheel scrolling for the ultrawide side panel (the `.uw-detail` that contains `contentRef`).
 * The panel sits under the rail's `data-lenis-prevent`, which keeps Lenis out of it, so this eases
 * `scrollTop` toward a target itself. Wheel input only moves the target; each frame closes a fixed
 * share of the gap, so a new wheel tick while moving just retargets and never restarts. Plain native
 * scrolling stays for touch, reduced motion, and anything marked `data-native-scroll`.
 * Returns jump helpers that use the same easing; they fall back to `scrollTo({ behavior })`.
 */
export function usePanelScroll(contentRef: RefObject<HTMLElement | null>, resetKey: string) {
  const state = useRef<{ wrapper: HTMLElement | null; target: number; frame: number; smooth: boolean }>({ wrapper: null, target: 0, frame: 0, smooth: false });

  useEffect(() => {
    const wrapper = contentRef.current?.closest<HTMLElement>('.uw-detail') ?? null;
    const s = state.current;
    s.wrapper = wrapper;
    if (!wrapper) return;
    s.smooth = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReducedMotion();
    s.target = wrapper.scrollTop;

    let last = 0;
    const tick = (time: number) => {
      const dt = last ? Math.min(time - last, 50) : 16.7;
      last = time;
      const diff = s.target - wrapper.scrollTop;
      if (Math.abs(diff) < SETTLED_PX) {
        wrapper.scrollTop = s.target;
        s.frame = 0;
        last = 0;
        return;
      }
      wrapper.scrollTop += diff * (1 - Math.pow(1 - LERP_PER_FRAME, dt / 16.7));
      s.frame = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!s.frame) s.frame = requestAnimationFrame(tick);
    };
    const maxScroll = () => wrapper.scrollHeight - wrapper.clientHeight;

    const onWheel = (e: WheelEvent) => {
      if (!s.smooth || e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if ((e.target as Element).closest('[data-native-scroll]')) return;
      e.preventDefault();
      const delta = e.deltaMode === 1 ? e.deltaY * LINE_HEIGHT_PX : e.deltaY;
      s.target = Math.min(maxScroll(), Math.max(0, s.target + delta * WHEEL_MULTIPLIER));
      start();
    };
    // Scrolls that did not come from the wheel (keyboard, scrollbar, a link) move the target along.
    const onScroll = () => {
      if (!s.frame) s.target = wrapper.scrollTop;
    };

    wrapper.addEventListener('wheel', onWheel, { passive: false });
    wrapper.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      wrapper.removeEventListener('wheel', onWheel);
      wrapper.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(s.frame);
      s.frame = 0;
    };
  }, [contentRef]);

  // Another post opens at its top.
  useEffect(() => {
    const s = state.current;
    s.target = 0;
    if (s.wrapper) s.wrapper.scrollTop = 0;
  }, [resetKey]);

  const scrollTo = useCallback((top: number) => {
    const s = state.current;
    const wrapper = s.wrapper;
    if (!wrapper) return;
    if (!s.smooth) {
      wrapper.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      return;
    }
    s.target = Math.min(wrapper.scrollHeight - wrapper.clientHeight, Math.max(0, top));
    // Same loop as the wheel: nudge it by dispatching through a scroll-less path.
    if (!s.frame) {
      const step = () => {
        const diff = s.target - wrapper.scrollTop;
        if (Math.abs(diff) < SETTLED_PX) {
          wrapper.scrollTop = s.target;
          s.frame = 0;
          return;
        }
        wrapper.scrollTop += diff * LERP_PER_FRAME;
        s.frame = requestAnimationFrame(step);
      };
      s.frame = requestAnimationFrame(step);
    }
  }, []);

  const scrollToId = useCallback((id: string) => {
    const wrapper = state.current.wrapper;
    const el = document.getElementById(id);
    if (!wrapper || !el) return;
    scrollTo(el.getBoundingClientRect().top - wrapper.getBoundingClientRect().top + wrapper.scrollTop - JUMP_CLEARANCE_PX);
  }, [scrollTo]);

  const scrollToTop = useCallback(() => scrollTo(0), [scrollTo]);

  return { scrollToId, scrollToTop };
}
