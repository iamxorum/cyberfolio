'use client';

import { useState } from 'react';
import type { SignatureState } from '@/hooks/useSignature';

/** Password field that adds the signature to the downloaded PDFs. Renders nothing when the feature is off. */
export default function SignatureUnlock({ signature }: { signature: SignatureState }) {
  const [password, setPassword] = useState('');
  const { status, error, unlock, lock } = signature;

  if (status === 'unlocked') {
    return (
      <div className="mt-4 flex items-center gap-2 font-mono text-xs sm:text-sm text-primary">
        <span aria-hidden="true" className="material-symbols-outlined text-base">draw</span>
        <span>Signature will be added to the PDF</span>
        <button type="button" onClick={() => { lock(); setPassword(''); }} className="ml-2 cursor-pointer text-[var(--terminal-text-muted)] underline hover:text-primary">
          remove
        </button>
      </div>
    );
  }

  return (
    <form
      className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2"
      onSubmit={(event) => { event.preventDefault(); if (password) unlock(password); }}
    >
      <label htmlFor="signature-password" className="flex items-center gap-2 font-mono text-xs sm:text-sm text-[var(--terminal-text-dim)]">
        <span aria-hidden="true" className="material-symbols-outlined text-base">draw</span>
        Sign the PDF
      </label>
      <input
        id="signature-password"
        type="password"
        autoComplete="off"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="password"
        className="h-9 rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] px-3 font-mono text-xs sm:text-sm text-[var(--terminal-text)] focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === 'checking' || !password}
        className="h-9 cursor-pointer rounded border border-primary px-4 font-mono text-xs sm:text-sm text-primary transition hover:bg-[var(--terminal-surface-hover)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'checking' ? 'CHECKING...' : 'UNLOCK'}
      </button>
      {error && <span role="alert" className="font-mono text-xs text-red-400">{error}</span>}
    </form>
  );
}
