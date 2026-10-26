import { useEffect, useState, type RefObject } from 'react';

// The back-to-top control shows once you are this far down the page.
const BACK_TO_TOP_AFTER_PX = 240;

/**
 * Time left and back-to-top state for the post in `[data-reading-target]`, as the window scrolls.
 * `minutesLeft` keeps its last value while `showLeft` is false, so a label can fade out without blanking.
 * Pass `barRef` to have a progress bar's `scaleX` follow the reading position (written directly, no re-render).
 */
export function useReadingStats(minutes: number, barRef?: RefObject<HTMLElement | null>) {
  const [minutesLeft, setMinutesLeft] = useState(minutes);
  const [showLeft, setShowLeft] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const target = document.querySelector('[data-reading-target]');
    if (!target) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, height } = target.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -top / Math.max(1, height - window.innerHeight)));
      if (barRef?.current) barRef.current.style.transform = `scaleX(${progress})`;
      const left = Math.ceil(minutes * (1 - progress));
      // Only a post longer than the screen has anything to count down.
      const counting = height > window.innerHeight && progress > 0.02 && left > 0;
      if (counting) setMinutesLeft(left);
      setShowLeft(counting);
      setShowTop(window.scrollY > BACK_TO_TOP_AFTER_PX);
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
  }, [minutes, barRef]);

  return { minutesLeft, showLeft, showTop };
}
