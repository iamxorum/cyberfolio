'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config';
import ThemeToggle from './ThemeToggle';
import EmailCTA from './EmailCTA';
import CommandPaletteButton from './CommandPaletteButton';
import { STAGGER_STEP_DENSE_MS } from '@/lib/motion';

// Stagger only opacity/transform/filter (the first three transitioned properties); the
// trailing 0ms keeps the hover colour change instant.
const staggerDelay = (index: number) => {
  const ms = `${90 + index * STAGGER_STEP_DENSE_MS}ms`;
  return `${ms}, ${ms}, ${ms}, 0ms`;
};

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const navItems = [
    { href: '/', label: './home' },
    { href: '/about', label: './profile' },
    { href: '/projects', label: './projects' },
    { href: '/blog', label: './blog' },
    { href: '/life', label: './life' },
  ];

  const currentIndex = navItems.findIndex((item) => item.href === pathname);

  const getTransitionTypes = (targetHref: string): string[] | undefined => {
    const targetIndex = navItems.findIndex((item) => item.href === targetHref);
    if (currentIndex === -1 || targetIndex === -1 || targetIndex === currentIndex) return undefined;
    return targetIndex > currentIndex ? ['nav-forward'] : ['nav-back'];
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
  }, [pathname]);

  // Publish the header's height so sticky elements below it (e.g. the About quick-nav) can stack under it.
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const publish = () => document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  // Close the mobile menu on Escape (returning focus to its button) or a tap outside the header.
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setIsMenuOpen(false);
      menuButtonRef.current?.focus();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setIsMenuOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isMenuOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="fixed top-2 -left-[9999px] focus:left-2 z-[100] bg-primary text-[var(--terminal-on-primary)] text-sm font-bold font-mono px-4 py-2 rounded"
      >
        Skip to content
      </a>
      <div
        ref={headerRef}
        className="w-full flex justify-center sticky top-0 z-50 bg-[var(--terminal-bg)]/95 border-b border-[var(--terminal-border)] backdrop-blur-sm"
        style={{ viewTransitionName: 'site-header' } as React.CSSProperties}
      >
      <div className="layout-content-container flex flex-col max-w-[1200px] w-full flex-1">
        <header className="flex items-center justify-between whitespace-nowrap px-3 sm:px-4 md:px-6 lg:px-10 py-2 sm:py-3">
          <Link href="/" aria-label={`Home, root@${siteConfig.username}`} className="flex items-center gap-2 sm:gap-4 text-[var(--terminal-text)] min-w-0 hover:opacity-80 active:scale-[0.97] transition">
            <span className="material-symbols-outlined text-primary text-xl sm:text-2xl flex-shrink-0">terminal</span>
            <h2 className="hidden min-[380px]:block text-[var(--terminal-text)] text-sm sm:text-base md:text-lg font-bold leading-tight tracking-[-0.015em] font-mono truncate">root@{siteConfig.username}:~</h2>
          </Link>
          <div className="flex flex-1 justify-end items-center gap-1.5 sm:gap-3 md:gap-6 lg:gap-8">
            <nav className="hidden sm:flex items-center gap-3 md:gap-4 lg:gap-6 xl:gap-9" aria-label="Primary">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  transitionTypes={getTransitionTypes(item.href)}
                  className={`transition-colors active:scale-[0.97] inline-block text-xs md:text-sm font-medium leading-normal font-mono whitespace-nowrap ${
                    pathname === item.href
                      ? 'text-primary glow-text'
                      : 'text-[var(--terminal-text-dim)] hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <EmailCTA
              className="flex items-center justify-center w-11 h-11 sm:w-9 sm:h-9 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] hover:text-primary hover:border-primary active:scale-95 transition flex-shrink-0"
              ariaLabel={`Email ${siteConfig.fullName}`}
              title={`Email ${siteConfig.fullName}`}
            >
              <span className="material-symbols-outlined text-base sm:text-lg">mail</span>
            </EmailCTA>
            <CommandPaletteButton />
            <ThemeToggle />
            <Link
              href="/cv"
              prefetch={false}
              className={`flex min-w-[50px] sm:min-w-[60px] md:min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded bg-primary hover:bg-primary/80 active:scale-[0.96] transition h-11 sm:h-9 px-3 sm:px-4 text-[var(--terminal-on-primary)] text-[10px] sm:text-xs md:text-sm font-bold leading-normal tracking-[0.015em] shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.4)] border border-primary/30 ${
                pathname === '/cv' ? 'ring-2 ring-primary/50' : ''
              }`}
              >
                <span className="material-symbols-outlined text-sm sm:text-base md:text-[18px] sm:mr-1 md:mr-2">download</span>
                <span className="hidden sm:inline truncate font-mono">GET_CV.sh</span>
                <span className="sm:hidden font-mono">CV</span>
            </Link>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-panel"
              className="sm:hidden flex items-center justify-center w-11 h-11 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] hover:text-primary hover:border-primary active:scale-95 transition flex-shrink-0"
            >
              <span className="material-symbols-outlined text-lg">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </header>
        {/* Overlay: floats over the page under the header, so opening it never shifts content.
            Opens with a top-to-bottom wipe, then the rows blur-in one after another (same feel as
            the site's reveal animation). Reduced-motion users get the global instant fallback. */}
        <div
          id="mobile-nav-panel"
          inert={!isMenuOpen}
          className={`sm:hidden absolute top-full inset-x-0 border-b border-[var(--terminal-border)] bg-[var(--terminal-bg)]/95 backdrop-blur-sm shadow-[0_12px_24px_rgba(0,0,0,0.35)] transition-[clip-path,opacity,visibility] duration-300 ease-[var(--ease-out)] ${
            isMenuOpen
              ? 'visible opacity-100 [clip-path:inset(0_0_-40px_0)]'
              : 'invisible opacity-0 pointer-events-none [clip-path:inset(0_0_100%_0)]'
          }`}
        >
          <nav className="flex flex-col gap-1 px-3 py-3" aria-label="Primary">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                transitionTypes={getTransitionTypes(item.href)}
                style={{ transitionDelay: isMenuOpen ? staggerDelay(index) : '0ms' }}
                className={`flex items-center min-h-11 rounded px-3 py-2 text-sm font-medium font-mono transition-[opacity,transform,filter,color] duration-300 ease-[var(--ease-out)] ${
                  isMenuOpen ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 -translate-y-2 blur-[3px]'
                } ${
                  pathname === item.href
                    ? 'text-primary glow-text bg-[var(--terminal-hover-overlay)]'
                    : 'text-[var(--terminal-text-dim)] hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      </div>
    </>
  );
}

