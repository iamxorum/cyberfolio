'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'iamxorum_turnstile_verified';
const VALID_MS = 24 * 60 * 60 * 1000;

/** Shared 24h Turnstile pass across gated pages (About, CV) — verifying on one unlocks the other for the same window. */
export function useTurnstileVerification() {
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const timestamp = localStorage.getItem(STORAGE_KEY);
    const stillValid = !!timestamp && (Date.now() - parseInt(timestamp, 10)) < VALID_MS;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsVerified(stillValid);
    if (stillValid) document.documentElement.classList.add('turnstile-skip');
  }, []);

  const markVerified = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setIsVerified(true);
    document.documentElement.classList.add('turnstile-skip');
  };

  return { isVerified, markVerified };
}
