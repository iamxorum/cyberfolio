import { useCallback, useState } from 'react';

type Status = 'locked' | 'checking' | 'unlocked';

/**
 * Unlocks the signature image with a password checked by /api/signature. The image lives in memory only,
 * so a reload (or leaving /cv) locks it again.
 */
export function useSignature() {
  const [status, setStatus] = useState<Status>('locked');
  const [image, setImage] = useState<string>();
  const [error, setError] = useState<string>();

  const unlock = useCallback(async (password: string) => {
    setStatus('checking');
    setError(undefined);
    try {
      const response = await fetch('/api/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const reject = (message: string) => {
        setError(message);
        setStatus('locked');
      };
      if (!response.ok) return reject(response.status === 429 ? 'Too many tries, wait a minute' : 'Wrong password');
      const data = await response.json().catch(() => ({}));
      if (typeof data.image !== 'string') return reject('Wrong password');
      setImage(data.image);
      setStatus('unlocked');
    } catch {
      setError('Could not reach the server');
      setStatus('locked');
    }
  }, []);

  const lock = useCallback(() => {
    setImage(undefined);
    setStatus('locked');
  }, []);

  return { status, image, error, unlock, lock };
}

export type SignatureState = ReturnType<typeof useSignature>;
