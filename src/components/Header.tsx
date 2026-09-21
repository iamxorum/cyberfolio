'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config';
import ThemeToggle from './ThemeToggle';
import RevealContainer from './cv/RevealContainer';
import EmailCTA from './EmailCTA';

export default function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: './home' },
    { href: '/about', label: './profile' },
    { href: '/projects', label: './projects' },
    { href: '/blog', label: './blog' },
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

  return (
    <>
      <a
        href="#main-content"
        className="fixed top-2 -left-[9999px] focus:left-2 z-[100] bg-primary text-[var(--terminal-on-primary)] text-sm font-bold font-mono px-4 py-2 rounded"
      >
        Skip to content
      </a>
      <div
        className="w-full flex justify-center sticky top-0 z-50 bg-[var(--terminal-bg)]/95 border-b border-[var(--terminal-border)] backdrop-blur-sm"
        style={{ viewTransitionName: 'site-header' } as React.CSSProperties}
      >
      <div className="layout-content-container flex flex-col max-w-[1200px] w-full flex-1">
        <header className="flex items-center justify-between whitespace-nowrap px-3 sm:px-4 md:px-6 lg:px-10 py-2 sm:py-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-4 text-[var(--terminal-text)] min-w-0 hover:opacity-80 active:scale-[0.97] transition">
            <span className="material-symbols-outlined text-primary text-xl sm:text-2xl flex-shrink-0">terminal</span>
            <h2 className="text-[var(--terminal-text)] text-sm sm:text-base md:text-lg font-bold leading-tight tracking-[-0.015em] font-mono truncate">root@{siteConfig.username}:~</h2>
          </Link>
          <div className="flex flex-1 justify-end items-center gap-2 sm:gap-3 md:gap-6 lg:gap-8">
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
              className="hidden sm:flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] hover:text-primary hover:border-primary active:scale-95 transition flex-shrink-0"
              ariaLabel={`Email ${siteConfig.fullName}`}
              title={`Email ${siteConfig.fullName}`}
            >
              <span className="material-symbols-outlined text-base sm:text-lg">mail</span>
            </EmailCTA>
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Link
              href="/cv"
              prefetch={false}
              className={`flex min-w-[50px] sm:min-w-[60px] md:min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded bg-primary hover:bg-primary/80 active:scale-[0.96] transition h-8 sm:h-9 px-2 sm:px-4 text-[var(--terminal-on-primary)] text-[10px] sm:text-xs md:text-sm font-bold leading-normal tracking-[0.015em] shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.4)] border border-primary/30 ${
                pathname === '/cv' ? 'ring-2 ring-primary/50' : ''
              }`}
              >
                <span className="material-symbols-outlined text-sm sm:text-base md:text-[18px] sm:mr-1 md:mr-2">download</span>
                <span className="hidden sm:inline truncate font-mono">GET_CV.sh</span>
                <span className="sm:hidden font-mono">CV</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav-panel"
              className="sm:hidden flex items-center justify-center w-8 h-8 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-dim)] hover:text-primary hover:border-primary active:scale-95 transition flex-shrink-0"
            >
              <span className="material-symbols-outlined text-lg">{isMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </header>
        <div id="mobile-nav-panel" className="sm:hidden">
          <RevealContainer visible={isMenuOpen}>
            <nav className="flex flex-col gap-1 px-3 pb-3" aria-label="Primary">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  transitionTypes={getTransitionTypes(item.href)}
                  className={`rounded px-3 py-2 text-sm font-medium font-mono transition-colors ${
                    pathname === item.href
                      ? 'text-primary glow-text bg-[var(--terminal-hover-overlay)]'
                      : 'text-[var(--terminal-text-dim)] hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <EmailCTA
                className="text-left rounded px-3 py-2 text-sm font-medium font-mono text-[var(--terminal-text-dim)] hover:text-primary transition-colors"
                onNavigate={() => setIsMenuOpen(false)}
              >
                ./email_me
              </EmailCTA>
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-mono text-[var(--terminal-text-dim)]">theme</span>
                <ThemeToggle />
              </div>
            </nav>
          </RevealContainer>
        </div>
      </div>
      </div>
    </>
  );
}

