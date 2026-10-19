'use client';

import PageShell, { PageHeading } from '@/components/PageShell';
import { useState, type MouseEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { contentConfig } from '@/config';
import { eventProps, track } from '@/lib/track';
import UltrawideDetail from '@/components/UltrawideDetail';
import { useUltrawide } from '@/hooks/useUltrawide';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { STAGGER_STEP_MS, revealDelay } from '@/lib/motion';
import type { PostMeta } from '@/lib/blog';

interface BlogClientProps {
  posts: PostMeta[];
  /** Page views by slug; posts without enough views are absent. */
  views: Record<string, number>;
  /** The post named by `?post=`, and its server-rendered body (shown beside the list on ultrawide). */
  openSlug?: string;
  openBody?: ReactNode;
}

export default function BlogClient({ posts, views, openSlug, openBody }: BlogClientProps) {
  const router = useRouter();
  const listRef = useScrollReveal<HTMLDivElement>();
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const ultrawide = useUltrawide();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(openSlug ?? null);
  const selectedPost = posts.find((p) => p.slug === selectedSlug);

  // Ultrawide: a plain click opens the post beside the list. The body is rendered by the page on the
  // server for `?post=<slug>` (a server action cannot return the client components an MDX post uses).
  const openPost = (e: MouseEvent, slug: string) => {
    if (!ultrawide || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setSelectedSlug(slug);
    router.replace(`/blog?post=${slug}`, { scroll: false });
  };

  const tagCounts = new Map<string, number>();
  for (const post of posts) for (const tag of post.tags ?? []) tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
  const tags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const visiblePosts = activeTag ? posts.filter((p) => p.tags?.includes(activeTag)) : posts;

  return (
    <PageShell crumbs={[{ label: 'blog.log', href: '/blog' }]} rail>
      <div className="uw-panel uw-panel-list flex flex-col gap-4 sm:gap-6 md:gap-8">
      <PageHeading title={contentConfig.blog.title} subtitle={contentConfig.blog.subtitle}>
        {/* The feed is an XML document, not a page: prefetching it is pointless, so Link only handles the click. */}
        <Link
          href="/blog/rss.xml"
          prefetch={false}
          {...eventProps('blog_rss_click')}
          className="animate-reveal mt-1 inline-flex w-fit items-center gap-1.5 text-xs font-mono text-[var(--terminal-text-dim)] hover:text-primary transition-colors"
          style={{ animationDelay: '200ms' }}
        >
          <span className="material-symbols-outlined text-base" aria-hidden="true">rss_feed</span>
          RSS
        </Link>
      </PageHeading>

      {tags.length > 1 && (
        <div role="group" aria-label="Filter posts by tag" className="flex flex-wrap gap-2 font-mono text-xs">
          <button
            type="button"
            aria-pressed={activeTag === null}
            onClick={() => { track('blog_tag_filter', { tag: 'all' }); setActiveTag(null); }}
            className={`px-2.5 py-1 rounded border transition active:scale-95 ${activeTag === null ? 'border-primary text-primary bg-primary/10' : 'border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary'}`}
          >
            all ({posts.length})
          </button>
          {tags.map(([tag, count]) => (
            <button
              key={tag}
              type="button"
              aria-pressed={activeTag === tag}
              onClick={() => { track('blog_tag_filter', { tag: activeTag === tag ? 'all' : tag }); setActiveTag(activeTag === tag ? null : tag); }}
              className={`px-2.5 py-1 rounded border transition active:scale-95 ${activeTag === tag ? 'border-primary text-primary bg-primary/10' : 'border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary'}`}
            >
              #{tag} ({count})
            </button>
          ))}
        </div>
      )}

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
              {...eventProps('blog_post_open', { post: post.slug })}
              onClick={(e) => openPost(e, post.slug)}
              aria-current={post.slug === selectedSlug ? 'true' : undefined}
              data-reveal
              style={revealDelay(Math.min(index, 4) * STAGGER_STEP_MS)}
              className="scroll-reveal panel-draw relative group flex flex-col gap-2 rounded border-2 border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] p-4 sm:p-5 transition-[transform,background-color,border-color,box-shadow] duration-300 hover:bg-[var(--terminal-surface-hover)] hover:border-primary hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(var(--terminal-accent-rgb),0.3)] active:scale-[0.98] aria-[current=true]:border-primary aria-[current=true]:bg-[var(--terminal-surface-hover)]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-[var(--terminal-text)] text-lg font-bold font-mono group-hover:text-primary transition-colors">
                  {post.title}
                </h2>
                <span className="text-[var(--terminal-text-dim)] text-xs font-mono flex-shrink-0">
                  {post.date && <>{post.date} · </>}{post.readingMinutes} min{views[post.slug] && <> · {views[post.slug].toLocaleString('en-US')} views</>}
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
      {ultrawide && (
        <UltrawideDetail label="POST">
          {selectedPost && (
            <article key={selectedPost.slug} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2 border-b border-[var(--terminal-border-alt)] pb-5">
                <h2 className="text-[var(--terminal-text)] text-2xl md:text-3xl font-black leading-tight tracking-tight font-mono">{selectedPost.title}</h2>
                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--terminal-text-dim)]">
                  {selectedPost.date && <span>{selectedPost.date}</span>}
                  <span>{selectedPost.readingMinutes} min read</span>
                  {views[selectedPost.slug] && <span>{views[selectedPost.slug].toLocaleString('en-US')} views</span>}
                  <Link href={`/blog/${selectedPost.slug}`} className="ml-auto hover:text-primary transition-colors">OPEN_FULL_PAGE →</Link>
                </div>
              </div>
              {(openSlug === selectedPost.slug && openBody) || (
                <p className="font-mono text-sm text-[var(--terminal-text-dim)] animate-pulse">LOADING_POST...</p>
              )}
            </article>
          )}
        </UltrawideDetail>
      )}
    </PageShell>
  );
}
