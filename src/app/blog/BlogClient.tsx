'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import InitScreen from '@/components/InitScreen';
import Link from 'next/link';
import { contentConfig } from '@/config';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import type { PostMeta } from '@/lib/blog';

interface BlogClientProps {
  posts: PostMeta[];
}

export default function BlogClient({ posts }: BlogClientProps) {
  const { initialized, setInitialized } = useAppInitialization();

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-hidden font-display">
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
                </div>

                {/* Post list */}
                {posts.length === 0 ? (
                  <div className="border border-dashed border-[var(--terminal-border)] rounded p-6 text-center font-mono text-sm text-[var(--terminal-text-dim)]">
                    No posts yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {posts.map((post) => (
                      <Link
                        key={post.slug}
                        href={`/blog/${post.slug}`}
                        className="group flex flex-col gap-2 rounded border-2 border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] p-4 sm:p-5 transition-[transform,background-color,border-color,box-shadow] duration-300 hover:bg-[var(--terminal-surface-hover)] hover:border-primary hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(var(--terminal-accent-rgb),0.3)] active:scale-[0.98]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <h2 className="text-[var(--terminal-text)] text-lg font-bold font-mono group-hover:text-primary transition-colors">
                            {post.title}
                          </h2>
                          {post.date && (
                            <span className="text-[var(--terminal-text-dim)] text-xs font-mono flex-shrink-0">{post.date}</span>
                          )}
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
