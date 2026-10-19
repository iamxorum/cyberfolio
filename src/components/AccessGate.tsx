'use client';

import { useRouter } from 'next/navigation';
import TurnstileGate from '@/components/TurnstileGate';

/** Stands in for a protected page until the visitor passes Turnstile, then reloads it with access. */
export default function AccessGate() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--terminal-bg)]">
      <TurnstileGate decryptingLabel="VERIFYING..." onVerified={() => router.refresh()} />
    </div>
  );
}
