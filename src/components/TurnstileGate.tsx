'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Turnstile } from '@marsidev/react-turnstile';
import { securityConfig } from '@/config';
import { getTurnstileSiteKey } from '@/lib/turnstile';

interface TurnstileGateProps {
  decryptingLabel: string;
  /** Called once the server has accepted the token and set the access cookie. */
  onVerified: () => void;
}

export default function TurnstileGate({ decryptingLabel, onVerified }: TurnstileGateProps) {
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // A modal dialog traps focus and makes the page behind it inert.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    // Escape is blocked: the gate stays until the check passes.
    <dialog
      ref={dialogRef}
      aria-labelledby="gate-title"
      onCancel={(e) => e.preventDefault()}
      className="m-0 h-full max-h-none w-full max-w-none items-center justify-center border-0 bg-[rgba(var(--terminal-bg-rgb),0.85)] p-4 font-mono text-inherit backdrop-blur-md open:flex"
    >
      <div className="max-w-md w-full border border-[var(--terminal-border)] bg-[var(--terminal-surface)] p-8 rounded shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.2)] text-center relative overflow-hidden">
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

        <h1 id="gate-title" className="text-[var(--terminal-text)] text-xl font-bold mb-2 tracking-widest uppercase">
          {isDecrypting ? decryptingLabel : 'Access_Restriction'}
        </h1>

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

                  if (!res.ok) {
                    const body = await res.json().catch(() => null);
                    console.error("Access Denied:", body?.error ?? `HTTP ${res.status}`);
                    setIsDecrypting(false);
                    setError('Verification failed. Please try again.');
                    return;
                  }

                  const data = await res.json();

                  if (data.success) {
                    setTimeout(onVerified, 500);
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

        <div role="status" className="text-xs text-[var(--terminal-text-muted)] animate-pulse font-mono uppercase tracking-tighter">
          {isDecrypting ? '>> VERIFIED' : 'Awaiting_Challenge_Response...'}
        </div>

        {!isDecrypting && (
          <Link href="/" className="mt-4 inline-block text-xs text-[var(--terminal-text-dim)] hover:text-primary transition-colors">
            &lt; Back to home
          </Link>
        )}
      </div>
    </dialog>
  );
}
