'use client';

import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { copyText } from '@/lib/copy-text';
import { track } from '@/lib/track';

const COPIED_MS = 1800;

/** MDX `pre` with a copy button that appears on hover/focus (always visible on touch). */
export default function CodeBlock({ children, ...props }: ComponentProps<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    const text = preRef.current?.textContent ?? '';
    // Leaves the label unchanged if the clipboard is blocked.
    if (await copyText(text)) {
      setCopied(true);
      track('code_copy', { from: window.location.pathname });
    }
  };

  return (
    <div data-reveal className="scroll-reveal relative group/code mb-4">
      <pre
        ref={preRef}
        className="rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg-dark)] p-4 overflow-x-auto text-[13px] leading-relaxed [&>code]:bg-transparent [&>code]:border-0 [&>code]:p-0"
        {...props}
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied to clipboard' : 'Copy code'}
        className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface)] text-[10px] font-mono text-[var(--terminal-text-dim)] hover:text-primary hover:border-primary transition opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/code:opacity-100 focus-visible:opacity-100"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
        {copied ? 'COPIED' : 'COPY'}
      </button>
    </div>
  );
}
