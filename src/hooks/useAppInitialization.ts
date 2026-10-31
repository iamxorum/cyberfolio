import { useState, useEffect, useRef } from 'react';
import { features } from '@/config';
import { INITIALIZED_KEY, USER_ID_KEY } from '@/lib/storage-keys';

// The boot sequence is a switched-off feature, and also an animation that calm mode removes.
const skipBoot = !features.bootScreen || features.calmMode;

export function useAppInitialization() {
  // With the boot screen switched off the app starts initialised, so InitScreen never renders.
  const [initialized, setInitialized] = useState(skipBoot);
  const [userId, setUserId] = useState<string>('');
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !initializedRef.current) {
      initializedRef.current = true;

      const initTimestamp = localStorage.getItem(INITIALIZED_KEY);
      const rawUserId = localStorage.getItem(USER_ID_KEY);
      const storedUserId = rawUserId && /^\d{6}$/.test(rawUserId) ? rawUserId : null;

      const isInitialized = skipBoot || (initTimestamp && (Date.now() - parseInt(initTimestamp)) < 24 * 60 * 60 * 1000);

      if (isInitialized && storedUserId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserId(storedUserId);
        setInitialized(true);
        document.documentElement.classList.add('boot-skip');
      } else {
        const newUserId = crypto.getRandomValues(new Uint32Array(1))[0].toString().slice(-6).padStart(6, '0');
        setUserId(newUserId);
        localStorage.setItem(USER_ID_KEY, newUserId);
      }
    }

    return () => {
      initializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (initialized) {
      document.documentElement.classList.add('boot-done');
    }
  }, [initialized]);

  return { initialized, setInitialized, userId };
}
