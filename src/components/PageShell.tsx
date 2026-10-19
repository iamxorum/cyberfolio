'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import { useAppInitialization } from '@/hooks/useAppInitialization';

interface Crumb {
  label: string;
  /** Omit on the last crumb to render it as plain text. */
  href?: string;
}

const MAX_WIDTH = {
  narrow: 'max-w-[720px]',
  medium: 'max-w-[820px]',
  wide: 'max-w-[960px]',
} as const;

interface PageShellProps {
  /** Trail shown after `~/root`. */
  crumbs: Crumb[];
  width?: keyof typeof MAX_WIDTH;
  /** Gap classes between the breadcrumb and the page content. */
  gap?: string;
  /** Fade the whole page in once it mounts. */
  fadeIn?: boolean;
  /** A function child receives the visitor's boot-screen user id. */
  children: ReactNode | ((userId: string) => ReactNode);
}

const crumbLink = 'text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors';

function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm font-mono tracking-wide">
      <span className="material-symbols-outlined text-[var(--terminal-text-dim)] text-lg">folder_open</span>
      <Link href="/" className={crumbLink}>~/root</Link>
      {crumbs.map(({ label, href }) => (
        <span key={label} className="contents">
          <span className="text-[var(--terminal-text-dim)]">/</span>
          {href ? (
            <Link href={href} className={crumbLink}>{label}</Link>
          ) : (
            <span className="text-[var(--terminal-text)]">{label}</span>
          )}
        </span>
      ))}
      <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
    </div>
  );
}

/** Page chrome shared by the terminal-styled routes: boot screen, grid backdrop, header, breadcrumbs, footer. */
export default function PageShell({
  crumbs,
  width = 'wide',
  gap = 'gap-4 sm:gap-6 md:gap-8',
  fadeIn = false,
  children,
}: PageShellProps) {
  const { initialized, setInitialized, userId } = useAppInitialization();

  return (
    <>
      {!initialized && <InitScreen onInit={() => setInitialized(true)} />}
      <div className={`relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-clip font-display${fadeIn ? ' animate-fade-in' : ''}`}>
        <div
          className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className="layout-container flex h-full grow flex-col">
          <Header />
          <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 relative z-10">
            <div className={`layout-content-container flex flex-col ${MAX_WIDTH[width]} w-full flex-1`}>
              <main id="main-content" tabIndex={-1}>
                <div className={`flex flex-col ${gap}`}>
                  <Breadcrumbs crumbs={crumbs} />
                  {typeof children === 'function' ? children(userId) : children}
                </div>
              </main>
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface PageHeadingProps {
  title: string;
  subtitle: string;
  /** Extra lines under the subtitle. */
  children?: ReactNode;
  /** Sits opposite the title on wide screens. */
  aside?: ReactNode;
}

export function PageHeading({ title, subtitle, children, aside }: PageHeadingProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 sm:gap-6 border-b border-[var(--terminal-border-alt)] pb-4 sm:pb-6">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h1 className="animate-reveal text-[var(--terminal-text)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight uppercase">
          {title}
        </h1>
        <p className="animate-reveal text-[var(--terminal-text-muted)] text-sm sm:text-base md:text-lg font-mono" style={{ animationDelay: '130ms' }}>
          {subtitle}
        </p>
        {children}
      </div>
      {aside}
    </div>
  );
}
