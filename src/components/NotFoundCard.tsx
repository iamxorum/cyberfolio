'use client';

import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { features, projects, siteConfig } from '@/config';
import { OPEN_PALETTE_EVENT } from './CommandPalette';

const PAGES = [
  { href: '/about', label: './profile', icon: 'person' },
  { href: '/projects', label: './projects', icon: 'folder_open' },
  ...(features.blog ? [{ href: '/blog', label: './blog', icon: 'article' }] : []),
  ...(features.life ? [{ href: '/life', label: './life', icon: 'directions_run' }] : []),
  ...(features.cv ? [{ href: '/cv', label: './cv', icon: 'download' }] : []),
];

const KNOWN_PATHS = ['/', ...PAGES.map((p) => p.href), ...projects.filter((p) => p.visibility === 'public').map((p) => `/projects/${p.id}`)];

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return row[b.length];
}

// A typo guess: the closest real path, but only if it is genuinely close.
function closestPath(path: string): string | null {
  const needle = path.toLowerCase().replace(/\/+$/, '') || '/';
  let best: { path: string; distance: number } | null = null;
  for (const candidate of KNOWN_PATHS) {
    const distance = editDistance(needle, candidate.toLowerCase());
    if (!best || distance < best.distance) best = { path: candidate, distance };
  }
  return best && best.distance <= Math.max(2, Math.floor(needle.length / 3)) ? best.path : null;
}

const MAX_SHOWN_PATH = 48;

export default function NotFoundCard() {
  // This page has no boot screen, and the entrance animations stay paused until the boot is marked done.
  useEffect(() => {
    document.documentElement.classList.add('boot-done');
  }, []);

  // The 404 page is prerendered, so on the server usePathname() is not the URL the visitor asked for.
  // Showing it only after hydration keeps the server and client markup identical (no hydration mismatch).
  const hydrated = useSyncExternalStore(() => () => {}, () => true, () => false);
  const livePathname = usePathname() || '/';
  const pathname = hydrated ? livePathname : '';
  const shown = pathname.length > MAX_SHOWN_PATH ? `${pathname.slice(0, MAX_SHOWN_PATH)}…` : pathname;
  const lastSegment = pathname.split('/').filter(Boolean).pop() ?? 'page';
  const suggestion = closestPath(pathname);

  return (
    <div className="max-w-xl w-full border border-[var(--terminal-border)] bg-[var(--terminal-surface)] rounded p-6 sm:p-8 text-center relative overflow-hidden shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.15)]">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[10%] w-full animate-scan pointer-events-none"></div>

      <h1 className="animate-reveal text-primary glow-text text-6xl sm:text-7xl font-black font-mono tracking-widest mb-1">404</h1>
      <p className="animate-reveal text-[var(--terminal-text)] font-mono text-sm sm:text-base font-bold mb-6" style={{ animationDelay: '100ms' }}>
        This page took a wrong turn at the firewall.
      </p>

      <div className="animate-reveal font-mono text-xs sm:text-sm text-left bg-[var(--terminal-bg)] border border-[var(--terminal-border)] rounded p-4 mb-6 break-all" style={{ animationDelay: '200ms' }}>
        <div>
          <span className="text-primary">{siteConfig.username}@web:~$</span> ls .{shown}
        </div>
        <div className="text-red-400 mt-1">ls: cannot access &apos;.{shown}&apos;: No such file or directory</div>
        <div className="mt-3">
          <span className="text-primary">{siteConfig.username}@web:~$</span> sudo find / -name &quot;{lastSegment}&quot;
        </div>
        <div className="text-[var(--terminal-text-dim)] mt-1">
          find: 0 results. It&apos;s either in another castle or it never existed.
        </div>
      </div>

      {suggestion && (
        <p className="animate-reveal font-mono text-sm text-[var(--terminal-text-muted)] mb-6" style={{ animationDelay: '280ms' }}>
          Did you mean{' '}
          <Link href={suggestion} className="text-primary underline underline-offset-2 hover:text-primary/80">
            {suggestion}
          </Link>
          ?
        </p>
      )}

      <div className="animate-reveal flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-5" style={{ animationDelay: '340ms' }}>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded h-11 px-6 bg-primary text-[var(--terminal-on-primary)] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/80 active:scale-[0.97] transition shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.4)] border border-primary/30"
        >
          <span className="material-symbols-outlined text-lg" aria-hidden="true">home</span>
          <span className="font-mono">CD ~/</span>
        </Link>
        {features.commandPalette && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
            className="inline-flex items-center justify-center gap-2 rounded h-11 px-6 border border-[var(--terminal-border)] text-[var(--terminal-text-muted)] text-sm font-mono hover:border-primary hover:text-primary active:scale-[0.97] transition"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">search</span>
            SEARCH_SITE
            <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)]">⌘K / Ctrl K</kbd>
          </button>
        )}
      </div>

      <nav aria-label="Main pages" className="animate-reveal flex flex-wrap justify-center gap-2 font-mono text-xs" style={{ animationDelay: '420ms' }}>
        {PAGES.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary active:scale-95 transition"
          >
            <span className="material-symbols-outlined text-base" aria-hidden="true">{page.icon}</span>
            {page.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
