'use client';

import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import Link from 'next/link';
import { useAppInitialization } from '@/hooks/useAppInitialization';

interface BlogPostClientProps {
  title: string;
  date: string;
  tags?: string[];
  children: ReactNode;
}

export default function BlogPostClient({ title, date, tags, children }: BlogPostClientProps) {
  const { initialized, setInitialized } = useAppInitialization();

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-hidden font-display">
      {!initialized && <InitScreen onInit={() => setInitialized(true)} />}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 relative z-10">
          <div className="layout-content-container flex flex-col max-w-[720px] w-full flex-1">
            <main id="main-content" tabIndex={-1}>
              <div className="flex flex-col gap-6">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm font-mono tracking-wide">
                  <span className="material-symbols-outlined text-[var(--terminal-text-dim)] text-lg">folder_open</span>
                  <Link href="/" className="text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors">~/root</Link>
                  <span className="text-[var(--terminal-text-dim)]">/</span>
                  <Link href="/blog" className="text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors">blog.log</Link>
                  <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
                </div>

                {/* Post header */}
                <div className="flex flex-col gap-2 border-b border-[var(--terminal-border-alt)] pb-5">
                  <h1 className="text-[var(--terminal-text)] text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight font-mono">
                    {title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--terminal-text-dim)]">
                    {date && <span>{date}</span>}
                    {tags && tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tag) => (
                          <span key={tag} className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface)] border border-[var(--terminal-border)] text-[10px]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post content */}
                <article>{children}</article>
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
