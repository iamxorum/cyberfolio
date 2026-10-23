'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import UltrawideRail from '@/components/UltrawideRail';
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
  xl: 'max-w-[1200px]',
} as const;

interface PageShellProps {
  /** Trail shown after `~/root`; omit for no breadcrumb row. */
  crumbs?: Crumb[];
  width?: keyof typeof MAX_WIDTH;
  /** Gap classes between the breadcrumb and the page content. */
  gap?: string;
  /** On ultrawide screens, lay the children out as a horizontal rail. Children should be `.uw-panel` blocks. */
  rail?: boolean;
  /** On ultrawide screens, fit the page to one screen height instead of scrolling it (implied by `rail`). */
  viewport?: boolean;
  /** Keep the page printable: white background, no grid backdrop, full-width content. */
  printable?: boolean;
  /** Show the boot screen on a first visit. */
  boot?: boolean;
  /** Replaces the default stacked breadcrumbs + children layout inside `<main>` with the page's own. */
  mainClassName?: string;
  /** A function child receives the visitor's boot-screen user id. */
  children: ReactNode | ((userId: string) => ReactNode);
}

const crumbLink = 'text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors';

function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm font-mono tracking-wide">
      <span aria-hidden="true" className="material-symbols-outlined text-[var(--terminal-text-dim)] text-lg">folder_open</span>
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

const cx = (...parts: Array<string | false | undefined>) => parts.filter(Boolean).join(' ');

/** The page's own content: a horizontal rail, a custom `<main>`, or the default stacked layout. */
function ShellMain({ breadcrumbs, body, gap, rail, mainClassName }: {
  breadcrumbs: ReactNode;
  body: ReactNode;
  gap: string;
  rail: boolean;
  mainClassName?: string;
}) {
  if (rail) {
    return (
      <div className={cx('uw-stack flex flex-col', gap)}>
        {breadcrumbs}
        <UltrawideRail className="flex flex-col gap-4 sm:gap-6 md:gap-8">{body}</UltrawideRail>
      </div>
    );
  }
  return (
    <main id="main-content" tabIndex={-1} className={mainClassName}>
      {mainClassName ? (
        <>
          {breadcrumbs}
          {body}
        </>
      ) : (
        <div className={cx('flex flex-col', gap)}>
          {breadcrumbs}
          {body}
        </div>
      )}
    </main>
  );
}

/** Page chrome shared by the terminal-styled routes: boot screen, grid backdrop, header, breadcrumbs, footer. */
export default function PageShell({
  crumbs,
  width = 'wide',
  gap = 'gap-4 sm:gap-6 md:gap-8',
  rail = false,
  viewport = false,
  printable = false,
  boot = true,
  mainClassName,
  children,
}: PageShellProps) {
  const { initialized, setInitialized, userId } = useAppInitialization();
  const fitScreen = rail || viewport;
  const body = typeof children === 'function' ? children(userId) : children;

  return (
    <>
      {boot && !initialized && <InitScreen onInit={() => setInitialized(true)} />}
      <div className={cx(fitScreen && 'uw-shell', 'relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-clip font-display', printable && 'print:bg-white print:min-h-0')}>
        <div
          className={cx('fixed inset-0 z-0 opacity-[0.03] pointer-events-none', printable && 'print:hidden')}
          style={{
            backgroundImage: 'linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        ></div>
        <div className={cx('layout-container', fitScreen && 'uw-layout', 'flex h-full grow flex-col')}>
          <Header />
          <div className={cx(fitScreen && 'uw-content', 'px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 relative z-10', printable && 'print:px-0 print:py-0')}>
            <div className={cx('layout-content-container', fitScreen && 'uw-column', 'flex flex-col', MAX_WIDTH[width], 'w-full flex-1', printable && 'print:max-w-full')}>
              <ShellMain
                breadcrumbs={crumbs && <Breadcrumbs crumbs={crumbs} />}
                body={body}
                gap={gap}
                rail={rail}
                mainClassName={mainClassName}
              />
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
