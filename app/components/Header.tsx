'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: './home' },
    { href: '/about', label: './profile' },
    { href: '/projects', label: './projects' },
  ];

  return (
    <div className="w-full flex justify-center sticky top-0 z-50 bg-[var(--terminal-bg)]/95 border-b border-[var(--terminal-border)] backdrop-blur-sm">
      <div className="layout-content-container flex flex-col max-w-[1200px] w-full flex-1">
        <header className="flex items-center justify-between whitespace-nowrap px-3 sm:px-4 md:px-6 lg:px-10 py-2 sm:py-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-4 text-white min-w-0 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-primary text-xl sm:text-2xl flex-shrink-0">terminal</span>
            <h2 className="text-white text-sm sm:text-base md:text-lg font-bold leading-tight tracking-[-0.015em] font-mono truncate">root@{siteConfig.username}:~</h2>
          </Link>
          <div className="flex flex-1 justify-end gap-2 sm:gap-3 md:gap-6 lg:gap-8">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-9">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors text-[10px] sm:text-xs md:text-sm font-medium leading-normal font-mono whitespace-nowrap ${
                    pathname === item.href
                      ? 'text-primary glow-text'
                      : 'text-[var(--terminal-text-dim)] hover:text-primary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            {siteConfig.cvUrl && (
              <a
                href={siteConfig.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[50px] sm:min-w-[60px] md:min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded bg-primary hover:bg-primary/80 transition-colors h-8 sm:h-9 px-2 sm:px-4 text-white text-[10px] sm:text-xs md:text-sm font-bold leading-normal tracking-[0.015em] shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.4)] border border-primary/30"
              >
                <span className="material-symbols-outlined text-sm sm:text-base md:text-[18px] sm:mr-1 md:mr-2">download</span>
                <span className="hidden sm:inline truncate font-mono">GET_CV.sh</span>
                <span className="sm:hidden font-mono">CV</span>
              </a>
            )}
          </div>
        </header>
      </div>
    </div>
  );
}

