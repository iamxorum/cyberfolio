import { useState, useEffect, useRef } from 'react';
import { features } from '@/config';

export function useAppInitialization() {
  // With the boot screen switched off the app starts initialised, so InitScreen never renders.
  const [initialized, setInitialized] = useState(!features.bootScreen);
  const [userId, setUserId] = useState<string>('');
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !initializedRef.current) {
      initializedRef.current = true;

      const initTimestamp = localStorage.getItem('iamxorum_initialized');
      const storedUserId = localStorage.getItem('iamxorum_user_id');

      const isInitialized = !features.bootScreen || (initTimestamp && (Date.now() - parseInt(initTimestamp)) < 24 * 60 * 60 * 1000);

      if (isInitialized && storedUserId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserId(storedUserId);
        setInitialized(true);
        document.documentElement.classList.add('boot-skip');
      } else {
        const newUserId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        setUserId(newUserId);
        localStorage.setItem('iamxorum_user_id', newUserId);
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
