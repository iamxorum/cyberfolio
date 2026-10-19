'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { securityConfig } from '@/config';
import { getTurnstileSiteKey } from '@/lib/turnstile';
import { copyText } from '@/lib/copy-text';

interface EmailCTAProps {
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  title?: string;
  /** Called when the mailto link is actually triggered (e.g. to close a mobile menu). */
  onNavigate?: () => void;
}

/**
 * Contact button that keeps the raw email address out of the server-rendered HTML until
 * Turnstile passes: plain mailto: text is exactly what email-harvesting bots regex for.
 * Once verified, the dialog shows the email and phone, with open, call and copy actions. Shares the 24h
 * verification flag with the /cv and /about gates, so solving it once unlocks everything.
 */
const actionButton = 'inline-flex items-center justify-center gap-2 rounded h-9 px-4 text-xs font-bold tracking-wide active:scale-[0.97] transition';

function ContactRow({ icon, value, copied, onCopy }: { icon: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="flex items-center gap-2 rounded border border-[var(--terminal-border)] px-2 py-1.5">
      <span className="material-symbols-outlined text-base text-primary" aria-hidden="true">{icon}</span>
      <span className="min-w-0 flex-1 break-all text-xs select-all">{value}</span>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Copy ${value}`}
        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-[var(--terminal-text-dim)] hover:text-primary active:scale-95 transition"
      >
        <span className="material-symbols-outlined text-base">{copied ? 'check' : 'content_copy'}</span>
      </button>
    </div>
  );
}

const errorText = (error: string | null) =>
  error && (
    <p className="text-red-400 text-[10px] mb-3" role="alert">
      {error}
    </p>
  );

interface ContactDetailsProps {
  email: string;
  phone: string;
  copied: 'email' | 'phone' | null;
  error: string | null;
  openMailRef: RefObject<HTMLAnchorElement | null>;
  onCopy: (field: 'email' | 'phone') => void;
  /** Called when the mail or call link is followed. */
  onNavigate: () => void;
}

function ContactDetails({ email, phone, copied, error, openMailRef, onCopy, onNavigate }: ContactDetailsProps) {
  return (
    <>
      <span className="material-symbols-outlined text-primary text-2xl mb-2 animate-pop-in">mark_email_read</span>
      <p className="text-[var(--terminal-text)] text-xs font-bold uppercase tracking-widest mb-1">Verified</p>
      <div className="mb-3 flex flex-col gap-2 text-left">
        {email && <ContactRow icon="mail" value={email} copied={copied === 'email'} onCopy={() => onCopy('email')} />}
        {phone && <ContactRow icon="call" value={phone} copied={copied === 'phone'} onCopy={() => onCopy('phone')} />}
      </div>
      {errorText(error)}
      <div className="flex flex-col sm:flex-row items-stretch justify-center gap-2">
        {email && (
          <a
            ref={openMailRef}
            href={`mailto:${email}`}
            onClick={onNavigate}
            className={`${actionButton} bg-primary text-[var(--terminal-on-primary)] hover:bg-primary/80`}
          >
            <span className="material-symbols-outlined text-base">mail</span>
            Open_Mail
          </a>
        )}
        {phone && (
          <a
            href={`tel:${phone.replace(/[^+\d]/g, '')}`}
            onClick={onNavigate}
            className={`${actionButton} border border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary`}
          >
            <span className="material-symbols-outlined text-base">call</span>
            Call
          </a>
        )}
      </div>
    </>
  );
}

function UnavailableNotice({ onRetry }: { onRetry: () => void }) {
  return (
    <>
      <span className="material-symbols-outlined text-red-400 text-2xl mb-2">error</span>
      <p className="text-[var(--terminal-text-dim)] text-[10px] mb-3 leading-relaxed">Contact is unavailable right now.</p>
      <button
        type="button"
        onClick={onRetry}
        className={`${actionButton} border border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary`}
      >
        Retry
      </button>
    </>
  );
}

function VerifyPrompt({ error, isVerifying, onToken }: { error: string | null; isVerifying: boolean; onToken: (token: string) => void }) {
  return (
    <>
      <span className="material-symbols-outlined text-primary text-2xl mb-2">mail_lock</span>
      <p className="text-[var(--terminal-text)] text-xs font-bold uppercase tracking-widest mb-1">Verify_To_Reveal</p>
      <p className="text-[var(--terminal-text-dim)] text-[10px] mb-3 leading-relaxed">
        Quick bot check before revealing contact details.
      </p>
      {errorText(error)}
      {isVerifying ? (
        <div className="text-[10px] text-primary uppercase tracking-widest animate-pulse">Verifying...</div>
      ) : (
        <div className="flex justify-center">
          <Turnstile siteKey={getTurnstileSiteKey()} onSuccess={onToken} options={{ theme: securityConfig.turnstile.theme }} />
        </div>
      )}
    </>
  );
}

type Status = 'loading' | 'locked' | 'ready' | 'error';

export default function EmailCTA({ className, children, ariaLabel, title, onNavigate }: EmailCTAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<Status>('loading');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState<'email' | 'phone' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const openMailRef = useRef<HTMLAnchorElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setIsVerifying(false);
    setCopied(null);
    setError(null);
  }, []);

  // The address only comes from the server, and only to a visitor holding the Turnstile access cookie.
  const loadEmail = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/contact', { cache: 'no-store' });
      if (res.status === 401) return setStatus('locked');
      if (!res.ok) return setStatus('error');
      const contact = await res.json();
      setEmail(contact.email ?? '');
      setPhone(contact.phone ?? '');
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  const open = () => {
    setIsOpen(true);
    void loadEmail();
  };

  // Native modal dialog: top layer, focus trap and Escape handling come from the browser.
  useEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    closeButtonRef.current?.focus();
    // Clicks on the ::backdrop are dispatched to the <dialog> itself.
    const dismissOnBackdrop = (e: MouseEvent) => {
      if (e.target === dialog) closeModal();
    };
    dialog.addEventListener('click', dismissOnBackdrop);
    return () => {
      dialog.removeEventListener('click', dismissOnBackdrop);
      dialog.close();
    };
  }, [isOpen, closeModal]);

  // Once the address shows, put focus on the main action.
  useEffect(() => {
    if (isOpen && status === 'ready') openMailRef.current?.focus();
  }, [isOpen, status]);

  // Not every device has a mail app or can place calls, so each detail can also be copied.
  const copy = async (field: 'email' | 'phone') => {
    if (await copyText(field === 'email' ? email : phone)) {
      setCopied(field);
      setTimeout(() => setCopied(null), 1800);
    } else {
      setError('Copy blocked. Press and hold the text to copy it.');
    }
  };

  const verify = async (token: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) await loadEmail();
      else setError('Verification failed. Try again.');
    } catch {
      setError('Network error. Try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <button type="button" onClick={open} className={className} aria-label={ariaLabel} title={title}>
        {children}
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        <dialog
          ref={dialogRef}
          aria-label="Verify to reveal contact details"
          onCancel={(e) => {
            e.preventDefault();
            closeModal();
          }}
          className="m-auto w-[calc(100%-2rem)] max-w-xs overflow-visible rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface)] p-4 shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.2)] text-center font-mono text-[var(--terminal-text)] backdrop:bg-[rgba(var(--terminal-bg-rgb),0.75)] backdrop:backdrop-blur-sm"
        >
          <div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeModal}
              aria-label="Close"
              className="absolute top-0.5 right-0.5 p-2.5 text-[var(--terminal-text-dim)] hover:text-[var(--terminal-text)] active:scale-95 transition-transform leading-none"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>

            {status === 'ready' && (
              <ContactDetails
                email={email}
                phone={phone}
                copied={copied}
                error={error}
                openMailRef={openMailRef}
                onCopy={copy}
                onNavigate={() => {
                  closeModal();
                  onNavigate?.();
                }}
              />
            )}
            {status === 'loading' && (
              <div className="py-4 text-[10px] text-primary uppercase tracking-widest animate-pulse">Loading...</div>
            )}
            {status === 'error' && <UnavailableNotice onRetry={loadEmail} />}
            {status === 'locked' && <VerifyPrompt error={error} isVerifying={isVerifying} onToken={verify} />}
          </div>
        </dialog>,
        document.body
      )}
    </>
  );
}
