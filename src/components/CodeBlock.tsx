'use client';

import { Children, isValidElement, useEffect, useRef, useState, type ComponentProps, type ReactNode } from 'react';
import { copyText } from '@/lib/copy-text';
import { track } from '@/lib/track';

const COPIED_MS = 1800;
// Fences in these languages are plain output, not code, so they get no language badge.
const PLAIN_LANGUAGES = new Set(['text', 'txt', 'plain', 'plaintext']);

/** "2,4-6" -> {2, 4, 5, 6}. */
function parseLines(spec: string | undefined) {
  const lines = new Set<number>();
  for (const part of spec?.split(',') ?? []) {
    const [from, to = from] = part.split('-').map(Number);
    if (Number.isInteger(from) && Number.isInteger(to) && to - from < 1000) for (let n = from; n <= to; n++) lines.add(n);
  }
  return lines;
}

type CodeElement = { props: { className?: string; children?: ReactNode; 'data-title'?: string; 'data-highlight'?: string } };

/** remark puts the fence's info-string props on the inner <code>, not on the <pre>. */
function readFence(children: ReactNode) {
  const codeElement = Children.toArray(children).find(isValidElement) as CodeElement | undefined;
  const className = codeElement?.props.className;
  const title = codeElement?.props['data-title'];
  const language = /language-([\w+#-]+)/.exec(className ?? '')?.[1];
  const shownLanguage = language && !PLAIN_LANGUAGES.has(language) ? language : null;
  return {
    className,
    title,
    shownLanguage,
    source: typeof codeElement?.props.children === 'string' ? codeElement.props.children : null,
    label: title ?? shownLanguage,
    marked: parseLines(codeElement?.props['data-highlight']),
  };
}

/** The copy button's "copied" flash: set on success, cleared after COPIED_MS. */
function useCopied() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  return [copied, setCopied] as const;
}

// Highlighting needs one element per line.
const highlightedLines = (source: string, marked: Set<number>) =>
  source.replace(/\n$/, '').split('\n').map((line, i) => (
    <span key={i} className={`-mx-4 block px-4 ${marked.has(i + 1) ? 'border-l-2 border-primary bg-[rgba(var(--terminal-accent-rgb),0.12)] pl-[calc(1rem-2px)]' : ''}`}>{line || ' '}</span>
  ));

/**
 * MDX `pre` with a copy button that appears on hover/focus (always visible on touch). A fence can carry
 * a file name and highlighted lines in its info string: ```yaml title="traefik.yml" {2,4-6}
 */
export default function CodeBlock({ children, ...preProps }: ComponentProps<'pre'>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useCopied();
  const { className, title, shownLanguage, source, label, marked } = readFence(children);

  const copy = async () => {
    const text = source ?? preRef.current?.textContent ?? '';
    // Leaves the label unchanged if the clipboard is blocked.
    if (await copyText(text)) {
      setCopied(true);
      track('code_copy', { from: window.location.pathname });
    }
  };

  // Without any marked line the code renders untouched.
  const highlighted = source !== null && marked.size > 0;

  return (
    <div data-reveal className="scroll-reveal relative group/code mb-4">
      {label && (
        <div className="flex items-center gap-2 rounded-t border border-b-0 border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] px-4 py-1.5 pr-20 font-mono text-xs text-[var(--terminal-text-dim)]">
          <span className="truncate">{label}</span>
          {title && shownLanguage && <span className="shrink-0 opacity-60">{shownLanguage}</span>}
        </div>
      )}
      <pre
        ref={preRef}
        className={`border border-[var(--terminal-border)] bg-[var(--terminal-bg-dark)] p-4 overflow-x-auto text-[13px] leading-relaxed [&>code]:bg-transparent [&>code]:border-0 [&>code]:p-0 ${label ? 'rounded-b' : 'rounded'}`}
        {...preProps}
      >
        {highlighted ? <code className={className}>{highlightedLines(source, marked)}</code> : children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied to clipboard' : 'Copy code'}
        className={`absolute right-2 flex items-center gap-1 px-2 py-1 rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface)] text-xs font-mono text-[var(--terminal-text-dim)] hover:text-primary hover:border-primary transition opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/code:opacity-100 focus-visible:opacity-100 ${label ? 'top-1' : 'top-2'}`}
      >
        <span aria-hidden="true" className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
        {copied ? 'COPIED' : 'COPY'}
      </button>
    </div>
  );
}
