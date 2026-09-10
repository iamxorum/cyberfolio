import { useEffect, useState } from 'react';

export function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1024));

  useEffect(() => {
    let resizeThrottle: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeThrottle) return;
      resizeThrottle = setTimeout(() => {
        setWindowWidth(window.innerWidth);
        resizeThrottle = null;
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeThrottle) clearTimeout(resizeThrottle);
    };
  }, []);

  return windowWidth;
}
