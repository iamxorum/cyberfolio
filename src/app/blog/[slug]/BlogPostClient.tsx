'use client';

import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import Link from 'next/link';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import TableOfContents from '@/components/TableOfContents';
import Reveal from '@/components/Reveal';
import type { AdjacentPost, PostHeading } from '@/lib/blog';

interface BlogPostClientProps {
  title: string;
  date: string;
  tags?: string[];
  readingMinutes: number;
  headings: PostHeading[];
  previous: AdjacentPost | null;
  next: AdjacentPost | null;
  children: ReactNode;
}

export default function BlogPostClient({ title, date, tags, readingMinutes, headings, previous, next, children }: BlogPostClientProps) {
  const { initialized, setInitialized } = useAppInitialization();
  const articleRef = useScrollReveal<HTMLElement>();

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-clip font-display">
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
                  <h1 className="animate-reveal text-[var(--terminal-text)] text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight font-mono">
                    {title}
                  </h1>
                  <div className="animate-reveal flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--terminal-text-dim)]" style={{ animationDelay: '130ms' }}>
                    {date && <span>{date}</span>}
                    <span>{readingMinutes} min read</span>
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

                <TableOfContents headings={headings} variant="inline" />

                {/* Post content. The relative wrapper anchors the desktop outline in the right margin. */}
                <div className="relative">
                  <TableOfContents headings={headings} variant="sidebar" />
                  <article ref={articleRef}>{children}</article>
                </div>

                {(previous || next) && (
                  <nav aria-label="More posts" className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[var(--terminal-border-alt)] pt-6">
                    {previous ? (
                      <Reveal draw className="rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] hover:border-primary transition-colors">
                        <Link href={`/blog/${previous.slug}`} className="flex flex-col gap-1 p-4 font-mono h-full">
                          <span className="flex items-center gap-1 text-[10px] tracking-widest text-[var(--terminal-text-dim)]">
                            <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
                            PREVIOUS
                          </span>
                          <span className="text-sm font-bold text-[var(--terminal-text)]">{previous.title}</span>
                        </Link>
                      </Reveal>
                    ) : <div className="hidden sm:block" />}
                    {next && (
                      <Reveal draw delay={80} className="rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] hover:border-primary transition-colors">
                        <Link href={`/blog/${next.slug}`} className="flex flex-col gap-1 p-4 font-mono h-full sm:text-right sm:items-end">
                          <span className="flex items-center gap-1 text-[10px] tracking-widest text-[var(--terminal-text-dim)]">
                            NEXT
                            <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                          </span>
                          <span className="text-sm font-bold text-[var(--terminal-text)]">{next.title}</span>
                        </Link>
                      </Reveal>
                    )}
                  </nav>
                )}
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
