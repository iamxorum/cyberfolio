'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import { useState } from 'react';
import Link from 'next/link';
import { contentConfig } from '@/config';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { STAGGER_STEP_MS, revealDelay } from '@/lib/motion';
import type { PostMeta } from '@/lib/blog';

interface BlogClientProps {
  posts: PostMeta[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  const { initialized, setInitialized } = useAppInitialization();
  const listRef = useScrollReveal<HTMLDivElement>();
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const tagCounts = new Map<string, number>();
  for (const post of posts) for (const tag of post.tags ?? []) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const visiblePosts = activeTag ? posts.filter((p) => p.tags?.includes(activeTag)) : posts;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-clip font-display">
      {!initialized && <InitScreen onInit={() => setInitialized(true)} />}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 relative z-10">
          <div className="layout-content-container flex flex-col max-w-[960px] w-full flex-1">
            <main id="main-content" tabIndex={-1}>
              <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm font-mono tracking-wide">
                  <span className="material-symbols-outlined text-[var(--terminal-text-dim)] text-lg">folder_open</span>
                  <Link href="/" className="text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors">~/root</Link>
                  <span className="text-[var(--terminal-text-dim)]">/</span>
                  <Link href="/blog" className="text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)] transition-colors">blog.log</Link>
                  <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse"></span>
                </div>

                {/* Page Heading */}
                <div className="flex flex-col gap-1 sm:gap-2 border-b border-[var(--terminal-border-alt)] pb-4 sm:pb-6">
                  <h1 className="animate-reveal text-[var(--terminal-text)] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight tracking-tight uppercase">
                    {contentConfig.blog.title}
                  </h1>
                  <p className="animate-reveal text-[var(--terminal-text-muted)] text-sm sm:text-base md:text-lg font-mono" style={{ animationDelay: '130ms' }}>
                    {contentConfig.blog.subtitle}
                  </p>
                  {/* The feed is an XML document, not a page: prefetching it is pointless, so Link only handles the click. */}
                  <Link
                    href="/blog/rss.xml"
                    prefetch={false}
                    className="animate-reveal mt-1 inline-flex w-fit items-center gap-1.5 text-xs font-mono text-[var(--terminal-text-dim)] hover:text-primary transition-colors"
                    style={{ animationDelay: '200ms' }}
                  >
                    <span className="material-symbols-outlined text-base" aria-hidden="true">rss_feed</span>
                    RSS
                  </Link>
                </div>

                {tags.length > 1 && (
                  <div role="group" aria-label="Filter posts by tag" className="flex flex-wrap gap-2 font-mono text-xs">
                    <button
                      type="button"
                      aria-pressed={activeTag === null}
                      onClick={() => setActiveTag(null)}
                      className={`px-2.5 py-1 rounded border transition active:scale-95 ${activeTag === null ? 'border-primary text-primary bg-primary/10' : 'border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary'}`}
                    >
                      all ({posts.length})
                    </button>
                    {tags.map(([tag, count]) => (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={activeTag === tag}
                        onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        className={`px-2.5 py-1 rounded border transition active:scale-95 ${activeTag === tag ? 'border-primary text-primary bg-primary/10' : 'border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary'}`}
                      >
                        #{tag} ({count})
                      </button>
                    ))}
                  </div>
                )}

                {/* Post list */}
                {posts.length === 0 ? (
                  <div className="border border-dashed border-[var(--terminal-border)] rounded p-6 text-center font-mono text-sm text-[var(--terminal-text-dim)]">
                    No posts yet.
                  </div>
                ) : (
                  // Keyed by the filter so the cards remount and each one is re-observed for its entrance.
                  <div key={activeTag ?? 'all'} ref={listRef} className="flex flex-col gap-3 sm:gap-4">
                    {visiblePosts.map((post, index) => (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        data-reveal
                        style={revealDelay(Math.min(index, 4) * STAGGER_STEP_MS)}
                        className="scroll-reveal panel-draw relative group flex flex-col gap-2 rounded border-2 border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] p-4 sm:p-5 transition-[transform,background-color,border-color,box-shadow] duration-300 hover:bg-[var(--terminal-surface-hover)] hover:border-primary hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(var(--terminal-accent-rgb),0.3)] active:scale-[0.98]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-[var(--terminal-text)] text-lg font-bold font-mono group-hover:text-primary transition-colors">
                            {post.title}
                          </h2>
                          <span className="text-[var(--terminal-text-dim)] text-xs font-mono flex-shrink-0">
                            {post.date && <>{post.date} · </>}{post.readingMinutes} min
                          </span>
                        </div>
                        {post.excerpt && (
                          <p className="text-[var(--terminal-text-muted)] text-sm font-mono leading-relaxed">
                            {post.excerpt}
                          </p>
                        )}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {post.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 rounded bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[10px] text-[var(--terminal-text-dim)] font-mono">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
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
