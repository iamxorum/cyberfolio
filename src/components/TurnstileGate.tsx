'use client';

import { useState } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { securityConfig } from '@/config';
import { getTurnstileSiteKey } from '@/lib/turnstile';
import { useTurnstileVerification } from '@/hooks/useTurnstileVerification';

interface TurnstileGateProps {
  decryptingLabel: string;
}

export default function TurnstileGate({ decryptingLabel }: TurnstileGateProps) {
  const { isVerified, markVerified } = useTurnstileVerification();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isVerified) return null;

  return (
    <div className="turnstile-gate-overlay fixed inset-0 z-[9998] flex items-center justify-center bg-[rgba(var(--terminal-bg-rgb),0.85)] backdrop-blur-md font-mono p-4">
      <div className="max-w-md w-full border border-[var(--terminal-border)] bg-[var(--terminal-surface)] p-8 rounded shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.2)] text-center relative overflow-hidden">
        {/* Decorative Scanline */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[10%] w-full animate-scan pointer-events-none"></div>

        <svg
          className="text-primary mb-4 animate-pulse mx-auto"
          style={{ width: '3rem', height: '3rem' }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 3l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>

        <h2 className="text-[var(--terminal-text)] text-xl font-bold mb-2 tracking-widest uppercase">
          {isDecrypting ? decryptingLabel : 'Access_Restriction'}
        </h2>

        <p className="text-[var(--terminal-text-dim)] text-xs mb-6 leading-relaxed">
          {isDecrypting
            ? 'Verification successful.'
            : 'This section is protected by Turnstile.'}
        </p>

        {error && (
          <p className="text-red-400 text-xs mb-4 leading-relaxed" role="alert">
            {error}
          </p>
        )}

        {!isDecrypting && (
          <div className="flex justify-center mb-6">
            <Turnstile
              siteKey={getTurnstileSiteKey()}
              onSuccess={async (token) => {
                setIsDecrypting(true);
                setError(null);

                try {
                  const res = await fetch('/api/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                  });

                  const data = await res.json();

                  if (data.success) {
                    setTimeout(() => {
                      markVerified();
                      setIsDecrypting(false);
                    }, 500);
                  } else {
                    console.error("Access Denied:", data.error);
                    setIsDecrypting(false);
                    setError('Verification failed. Please try again.');
                  }
                } catch (err) {
                  console.error("Network error during verification", err);
                  setIsDecrypting(false);
                  setError('Network error. Please try again.');
                }
              }}
              options={{
                theme: securityConfig.turnstile.theme,
              }}
            />
          </div>
        )}

        <div className="text-[10px] text-[var(--terminal-text-muted)] animate-pulse font-mono uppercase tracking-tighter">
          {isDecrypting ? '>> VERIFIED' : 'Awaiting_Challenge_Response...'}
        </div>
      </div>
    </div>
  );
}
