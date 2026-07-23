'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'iamxorum_turnstile_verified';
const VALID_MS = 24 * 60 * 60 * 1000;

/** Shared 24h Turnstile pass across gated pages (About, CV) — verifying on one unlocks the other for the same window. */
export function useTurnstileVerification() {
  const [isVerified, setIsVerified] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const timestamp = localStorage.getItem(STORAGE_KEY);
    const stillValid = !!timestamp && (Date.now() - parseInt(timestamp, 10)) < VALID_MS;
    setIsVerified(stillValid);
    setChecked(true);
  }, []);

  const markVerified = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    setIsVerified(true);
  };

  return { isVerified, checked, markVerified };
}
