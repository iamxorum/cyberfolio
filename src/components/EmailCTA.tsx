'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { siteConfig, securityConfig } from '@/config';
import { getTurnstileSiteKey } from '@/lib/turnstile';
import { useTurnstileVerification } from '@/hooks/useTurnstileVerification';

interface EmailCTAProps {
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  title?: string;
  /** Called when the mailto link is actually triggered (e.g. to close a mobile menu). */
  onNavigate?: () => void;
}

/**
 * Renders a mailto CTA that keeps the raw email address out of the server-rendered
 * HTML (and out of any click handler) until Turnstile passes — plain mailto: text is
 * exactly what email-harvesting bots regex for. Shares the same 24h verification flag
 * as the /cv and /about Turnstile gates, so solving it once unlocks everything.
 */
export default function EmailCTA({ className, children, ariaLabel, title, onNavigate }: EmailCTAProps) {
  const { isVerified, markVerified } = useTurnstileVerification();
  const [isOpen, setIsOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [justVerified, setJustVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openMailRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  useEffect(() => {
    if (justVerified) openMailRef.current?.focus();
  }, [justVerified]);

  const closeModal = () => {
    setIsOpen(false);
    setJustVerified(false);
    setIsVerifying(false);
    setError(null);
  };

  if (isVerified && !justVerified) {
    return (
      <a href={`mailto:${siteConfig.email}`} className={className} aria-label={ariaLabel} title={title} onClick={onNavigate}>
        {children}
      </a>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={className} aria-label={ariaLabel} title={title}>
        {children}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[rgba(var(--terminal-bg-rgb),0.75)] backdrop-blur-sm p-4"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Verify to reveal contact email"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xs rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface)] p-4 shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.2)] text-center font-mono"
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="absolute top-2 right-2 text-[var(--terminal-text-dim)] hover:text-[var(--terminal-text)] active:scale-95 transition-transform leading-none"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {justVerified ? (
              <>
                <span className="material-symbols-outlined text-primary text-2xl mb-2 animate-pop-in">mark_email_read</span>
                <p className="text-[var(--terminal-text)] text-xs font-bold uppercase tracking-widest mb-1">
                  Verified
                </p>
                <p className="text-[var(--terminal-text-dim)] text-[10px] mb-3 leading-relaxed">
                  {siteConfig.email}
                </p>
                <a
                  ref={openMailRef}
                  href={`mailto:${siteConfig.email}`}
                  onClick={() => {
                    closeModal();
                    onNavigate?.();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded h-9 px-4 bg-primary text-[var(--terminal-on-primary)] text-xs font-bold tracking-wide hover:bg-primary/80 active:scale-[0.97] transition"
                >
                  <span className="material-symbols-outlined text-base">mail</span>
                  Open_Mail
                </a>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-primary text-2xl mb-2">mail_lock</span>
                <p className="text-[var(--terminal-text)] text-xs font-bold uppercase tracking-widest mb-1">
                  Verify_To_Reveal
                </p>
                <p className="text-[var(--terminal-text-dim)] text-[10px] mb-3 leading-relaxed">
                  Quick bot check before opening your mail client.
                </p>

                {error && (
                  <p className="text-red-400 text-[10px] mb-3" role="alert">
                    {error}
                  </p>
                )}

                {!isVerifying ? (
                  <div className="flex justify-center">
                    <Turnstile
                      siteKey={getTurnstileSiteKey()}
                      onSuccess={async (token) => {
                        setIsVerifying(true);
                        setError(null);
                        try {
                          const res = await fetch('/api/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ token }),
                          });
                          const data = await res.json();
                          if (data.success) {
                            markVerified();
                            setIsVerifying(false);
                            setJustVerified(true);
                          } else {
                            setIsVerifying(false);
                            setError('Verification failed. Try again.');
                          }
                        } catch {
                          setIsVerifying(false);
                          setError('Network error. Try again.');
                        }
                      }}
                      options={{ theme: securityConfig.turnstile.theme }}
                    />
                  </div>
                ) : (
                  <div className="text-[10px] text-primary uppercase tracking-widest animate-pulse">
                    Verifying...
                  </div>
                )}
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
