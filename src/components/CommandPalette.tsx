'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { features, projects, siteConfig } from '@/config';
import { changelogEnabled } from '@/lib/changelog';
import { isLightTheme, setLightTheme } from '@/lib/theme';
import { track } from '@/lib/track';

export const OPEN_PALETTE_EVENT = 'open-command-palette';

interface PaletteBlogPost {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  headings: Array<{ text: string; id: string }>;
}

interface PaletteCommand {
  id: string;
  group: 'NAVIGATE' | 'BLOG' | 'PROJECTS' | 'ACTIONS' | 'LINKS';
  /** Section matches only show while searching, so the idle list stays short. */
  searchOnly?: boolean;
  label: string;
  icon: string;
  keywords: string;
  run: () => void;
}

// Substring hits (label first, then keywords) rank highest. Failing that, every query character must
// appear in order within the label ("prj" finds "projects"); keywords are excluded so long excerpts can't match noise.
function score(command: PaletteCommand, query: string): number {
  const label = command.label.toLowerCase();
  const inLabel = label.indexOf(query);
  if (inLabel !== -1) return 2000 - inLabel;
  const inKeywords = command.keywords.toLowerCase().indexOf(query);
  if (inKeywords !== -1) return 1000 - inKeywords;
  let from = 0;
  for (const ch of query) {
    from = label.indexOf(ch, from);
    if (from === -1) return -1;
    from += 1;
  }
  return 1;
}

export default function CommandPalette({ posts }: { posts: PaletteBlogPost[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const commands = useMemo<PaletteCommand[]>(() => {
    const go = (href: string) => () => router.push(href);
    const external = (url: string) => () => window.open(url, '_blank', 'noopener,noreferrer');
    const socials = [...(siteConfig.social.professional ?? []), ...(siteConfig.social.gaming ?? []), ...(siteConfig.social.other ?? [])];

    return [
      { id: 'nav-home', group: 'NAVIGATE', label: './home', icon: 'home', keywords: 'index main start', run: go('/') },
      { id: 'nav-about', group: 'NAVIGATE', label: './profile', icon: 'person', keywords: 'about bio experience skills education', run: go('/about') },
      { id: 'nav-projects', group: 'NAVIGATE', label: './projects', icon: 'folder_open', keywords: 'work portfolio', run: go('/projects') },
      ...(features.blog ? [{ id: 'nav-blog', group: 'NAVIGATE' as const, label: './blog', icon: 'article', keywords: 'posts writing articles', run: go('/blog') }] : []),
      ...(features.life ? [{ id: 'nav-life', group: 'NAVIGATE' as const, label: './life', icon: 'directions_run', keywords: features.strava ? 'running strava hobbies' : 'hobbies music', run: go('/life') }] : []),
      ...(changelogEnabled ? [{ id: 'nav-changelog', group: 'NAVIGATE' as const, label: './changelog', icon: 'history', keywords: 'releases versions updates news', run: go('/changelog') }] : []),
      ...(features.cv ? [{ id: 'nav-cv', group: 'NAVIGATE' as const, label: './cv', icon: 'download', keywords: 'resume cover letter pdf download', run: go('/cv') }] : []),
      ...posts.map<PaletteCommand>((post) => ({
        id: `post-${post.slug}`,
        group: 'BLOG',
        label: post.title,
        icon: 'article',
        keywords: `${post.tags.join(' ')} ${post.excerpt} blog post`,
        run: go(`/blog/${post.slug}`),
      })),
      ...posts.flatMap((post) =>
        post.headings.map<PaletteCommand>((heading) => ({
          id: `post-${post.slug}#${heading.id}`,
          group: 'BLOG',
          label: `${post.title} › ${heading.text}`,
          icon: 'tag',
          keywords: `${post.tags.join(' ')} section heading`,
          searchOnly: true,
          run: go(`/blog/${post.slug}#${heading.id}`),
        })),
      ),
      ...projects
        .filter((p) => p.visibility === 'public')
        .map<PaletteCommand>((p) => ({ id: `project-${p.id}`, group: 'PROJECTS', label: p.name, icon: p.icon, keywords: `${p.tags.join(' ')} project`, run: go(`/projects/${p.id}`) })),
      {
        id: 'toggle-theme',
        group: 'ACTIONS',
        label: 'toggle theme',
        icon: 'contrast',
        keywords: 'dark light mode appearance',
        run: () => setLightTheme(!isLightTheme()),
      },
      ...socials.map<PaletteCommand>((s) => ({ id: `link-${s.url}`, group: 'LINKS', label: s.name, icon: 'open_in_new', keywords: 'social external link', run: external(s.url) })),
    ];
  }, [router, posts]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands.filter((c) => !c.searchOnly);
    return commands
      .map((command) => ({ command, rank: score(command, q) }))
      .filter((r) => r.rank >= 0)
      .sort((a, b) => b.rank - a.rank)
      .map((r) => r.command);
  }, [commands, query]);

  const openPalette = useCallback(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setQuery('');
    setActive(0);
    setOpen(true);
    track('palette_open');
  }, []);

  // Global shortcut (⌘K / Ctrl+K) and the header button's custom event.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) close();
        else openPalette();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener(OPEN_PALETTE_EVENT, openPalette);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener(OPEN_PALETTE_EVENT, openPalette);
    };
  }, [open, close, openPalette]);

  // Clicking the dim area outside the panel (the dialog element itself) closes it.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClick = (e: MouseEvent) => {
      if (e.target === dialog) close();
    };
    dialog.addEventListener('click', onClick);
    return () => dialog.removeEventListener('click', onClick);
  }, [close]);

  // Native <dialog> gives focus trapping, inert background and Esc handling for free.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      returnFocusRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [active, results]);

  const runCommand = (command: PaletteCommand | undefined) => {
    if (!command) return;
    close();
    track('palette_command', { command: command.id });
    command.run();
  };

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (results.length ? (i + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      runCommand(results[active]);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      aria-label="Command palette"
      onClose={close}
      className="fixed inset-0 z-[100] m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="flex h-full items-start justify-center px-4 pt-[12vh] palette-backdrop pointer-events-none">
      <div
        data-lenis-prevent
        className="pointer-events-auto palette-panel w-full max-w-[560px] rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] shadow-[0_0_40px_rgba(var(--terminal-accent-rgb),0.2)] font-mono overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--terminal-border)]">
          <span className="text-primary" aria-hidden="true">&gt;</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-results"
            aria-activedescendant={results[active] ? `palette-${results[active].id}` : undefined}
            aria-label="Search pages, projects and actions"
            placeholder="go to... (try: proj, blog, theme)"
            spellCheck={false}
            autoComplete="off"
            className="flex-1 bg-transparent border-none outline-none text-sm text-[var(--terminal-text)] placeholder:text-[var(--terminal-text-dim)]"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)]">ESC</kbd>
        </div>

        <ul id="palette-results" ref={listRef} role="listbox" className="max-h-[50vh] overflow-y-auto py-1">
          {results.length === 0 && <li className="px-4 py-6 text-center text-xs text-[var(--terminal-text-dim)]">no matches for &quot;{query}&quot;</li>}
          {results.map((command, index) => {
            const showGroup = index === 0 || results[index - 1].group !== command.group;
            return (
              <li key={command.id} role="presentation">
                {showGroup && <div className="px-4 pt-2 pb-1 text-[10px] tracking-widest text-[var(--terminal-text-dim)]">{command.group}</div>}
                <div
                  id={`palette-${command.id}`}
                  role="option"
                  aria-selected={index === active}
                  onMouseMove={() => setActive(index)}
                  onClick={() => runCommand(command)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm cursor-pointer ${index === active ? 'bg-[var(--terminal-surface-hover)] text-primary' : 'text-[var(--terminal-text-muted)]'}`}
                >
                  <span className="material-symbols-outlined text-lg" aria-hidden="true">{command.icon}</span>
                  <span className="truncate">{command.label}</span>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-4 px-4 py-2 border-t border-[var(--terminal-border)] text-[10px] text-[var(--terminal-text-dim)]">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
        </div>
      </div>
        </div>
      )}
    </dialog>
  );
}
