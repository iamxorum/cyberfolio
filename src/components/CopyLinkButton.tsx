'use client';

import { useEffect, useState } from 'react';
import { copyText } from '@/lib/copy-text';
import { track } from '@/lib/track';

const COPIED_MS = 1800;

/** Copies the absolute URL of `path` (the canonical full page, which also works on narrower screens). */
export default function CopyLinkButton({ path, event, className = '' }: { path: string; event: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const onClick = async () => {
    if (!(await copyText(`${window.location.origin}${path}`))) return;
    track(event, { path });
    setCopied(true);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? 'Link copied to clipboard' : 'Copy link'}
      className={`inline-flex items-center gap-1.5 font-mono hover:text-primary transition-colors active:scale-95 ${copied ? 'text-primary' : ''} ${className}`.trim()}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-base">{copied ? 'check' : 'link'}</span>
      {copied ? 'COPIED' : 'COPY_LINK'}
    </button>
  );
}
