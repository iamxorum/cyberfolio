import { useState, useEffect, useRef } from 'react';

export function useAppInitialization() {
  const [initialized, setInitialized] = useState(false);
  // Whether we've finished checking localStorage yet. Kept separate from
  // `initialized` so the caller can avoid rendering the boot screen at all
  // during this brief check, instead of flashing it for returning visitors.
  const [checked, setChecked] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !initializedRef.current) {
      initializedRef.current = true;

      const initTimestamp = localStorage.getItem('iamxorum_initialized');
      const storedUserId = localStorage.getItem('iamxorum_user_id');

      const isInitialized = initTimestamp && (Date.now() - parseInt(initTimestamp)) < 24 * 60 * 60 * 1000;

      if (isInitialized && storedUserId) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserId(storedUserId);
        setInitialized(true);
      } else {
        const newUserId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        setUserId(newUserId);
        localStorage.setItem('iamxorum_user_id', newUserId);
      }
      setChecked(true);
    }

    return () => {
      initializedRef.current = false;
    };
  }, []);

  return { initialized, checked, setInitialized, userId };
}
