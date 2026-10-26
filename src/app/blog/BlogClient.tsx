'use client';

import PageShell, { PageHeading } from '@/components/PageShell';
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { contentConfig } from '@/config';
import { eventProps, track } from '@/lib/track';
import CopyLinkButton from '@/components/CopyLinkButton';
import UltrawideDetail from '@/components/UltrawideDetail';
import { useUltrawide } from '@/hooks/useUltrawide';
import { useEscapeKey } from '@/hooks/useEscapeKey';
import { usePanelScroll } from '@/hooks/usePanelScroll';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { STAGGER_STEP_MS, revealDelay } from '@/lib/motion';
import type { PostHeading, PostMeta } from '@/lib/blog';
import PanelOutline from '@/components/PanelOutline';
import { formatDate } from '@/lib/format-date';
import BlogFilters from './BlogFilters';
import { EMPTY_FILTERS, applyFilters, filtersToSearch, isFiltered, type FilterState } from './filters';

interface BlogClientProps {
  posts: PostMeta[];
  /** Page views by slug; posts without enough views are absent. */
  views: Record<string, number>;
  /** The post named by `?post=`, and its server-rendered body (shown beside the list on ultrawide). */
  openSlug?: string;
  openBody?: ReactNode;
  /** Headings of the open post, for the outline bar in the side panel. */
  openHeadings?: PostHeading[];
  /** Filters parsed from the URL on the server, so a shared link opens already filtered. */
  initialFilters?: FilterState;
}

function PostCard({ post, index, views, selected, showCategory, onOpen }: {
  post: PostMeta;
  showCategory: boolean;
  index: number;
  views?: number;
  selected: boolean;
  onOpen: (e: MouseEvent, slug: string) => void;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      {...eventProps('blog_post_open', { post: post.slug })}
      onClick={(e) => onOpen(e, post.slug)}
      aria-current={selected ? 'true' : undefined}
      data-post-card
      data-reveal
      style={revealDelay(Math.min(index, 4) * STAGGER_STEP_MS)}
      className="scroll-reveal panel-draw relative group flex flex-col gap-2 rounded border-2 border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] p-4 sm:p-5 transition-[transform,background-color,border-color,box-shadow] duration-300 hover:bg-[var(--terminal-surface-hover)] hover:border-primary hover:-translate-y-1 hover:shadow-[0_0_25px_rgba(var(--terminal-accent-rgb),0.3)] active:scale-[0.98] aria-[current=true]:border-primary aria-[current=true]:bg-[var(--terminal-surface-hover)]"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[var(--terminal-text-dim)] text-xs font-mono">
        {showCategory && <span className="text-primary uppercase tracking-wider">{post.category}</span>}
        {post.series && post.seriesTotal && post.seriesTotal > 1 && <span>{post.series} · part {post.seriesPart}/{post.seriesTotal}</span>}
        {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
        <span>{post.readingMinutes} min read</span>
        {views && <span>{views.toLocaleString('en-US')} views</span>}
      </div>
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-[var(--terminal-text)] text-lg sm:text-xl font-bold font-mono leading-snug group-hover:text-primary transition-colors">
          {post.title}
        </h2>
        <span className="material-symbols-outlined mt-0.5 text-xl text-[var(--terminal-text-dim)] transition-[color,transform] duration-300 group-hover:text-primary group-hover:translate-x-1" aria-hidden="true">arrow_forward</span>
      </div>
      {post.excerpt && (
        <p className="text-[var(--terminal-text-muted)] text-sm font-mono leading-relaxed">
          {post.excerpt}
        </p>
      )}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-[var(--terminal-text-dim)] font-mono">
          {post.tags.slice(0, 4).map((tag) => <span key={tag}>#{tag}</span>)}
          {post.tags.length > 4 && <span>+{post.tags.length - 4}</span>}
        </div>
      )}
    </Link>
  );
}

function PostDetail({ post, views, body, headings }: { post: PostMeta; views?: number; body?: ReactNode; headings?: PostHeading[] }) {
  const articleRef = useRef<HTMLElement>(null);
  const { scrollToId, scrollToTop } = usePanelScroll(articleRef, post.slug);
  const outline = headings && headings.length >= 3 ? headings : null;

  return (
    <article ref={articleRef} key={post.slug} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2 border-b border-[var(--terminal-border-alt)] pb-5">
        <h2 className="text-[var(--terminal-text)] text-2xl md:text-3xl font-black leading-tight tracking-tight font-mono">{post.title}</h2>
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--terminal-text-dim)]">
          {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
          {post.updated && post.updated !== post.date && <span>updated {formatDate(post.updated)}</span>}
          <span>{post.readingMinutes} min read</span>
          {views && <span>{views.toLocaleString('en-US')} views</span>}
          <span className="ml-auto flex items-center gap-4">
            <CopyLinkButton path={`/blog/${post.slug}`} event="blog_link_copy" />
            <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">OPEN_FULL_PAGE →</Link>
          </span>
        </div>
      </div>
      <div className="flex items-start gap-8">
        <div className="min-w-0 flex-1">{body && <div className="animate-fade-in-fast">{body}</div>}</div>
        {outline && body && <PanelOutline headings={outline} minutes={post.readingMinutes} onJump={scrollToId} onTop={scrollToTop} />}
      </div>
    </article>
  );
}

export default function BlogClient({ posts, views, openSlug, openBody, openHeadings, initialFilters = EMPTY_FILTERS }: BlogClientProps) {
  const router = useRouter();
  const listRef = useScrollReveal<HTMLDivElement>();
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const ultrawide = useUltrawide();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(openSlug ?? null);
  const selectedPost = posts.find((p) => p.slug === selectedSlug);

  // Ultrawide: a plain click opens the post beside the list. The body is rendered by the page on the
  // server for `?post=<slug>` (a server action cannot return the client components an MDX post uses).
  const openPost = (e: MouseEvent, slug: string) => {
    if (!ultrawide || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    setSelectedSlug(slug);
    router.replace(`/blog${filtersToSearch(filters, slug)}`, { scroll: false });
  };

  const closePost = useCallback(() => {
    setSelectedSlug(null);
    router.replace(`/blog${filtersToSearch(filters)}`, { scroll: false });
  }, [router, filters]);
  useEscapeKey(ultrawide && selectedSlug !== null, closePost);

  // Keep the address bar in step with the filters (and any open post) without a server round trip.
  const changeFilters = (next: FilterState) => {
    setFilters(next);
    window.history.replaceState(null, '', `/blog${filtersToSearch(next, selectedSlug)}`);
  };

  // `j` and `k` walk the visible cards with real focus, so Enter opens one and the focus ring shows where you are.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key !== 'j' && e.key !== 'k') || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable], [role="dialog"], dialog')) return;
      const cards = [...document.querySelectorAll<HTMLElement>('[data-post-card]')];
      if (cards.length === 0) return;
      e.preventDefault();
      const at = cards.indexOf(document.activeElement as HTMLElement);
      const to = e.key === 'j' ? Math.min(cards.length - 1, at + 1) : Math.max(0, at - 1);
      cards[to].focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const visiblePosts = applyFilters(posts, filters, views);

  // Under the default date sort with no category picked, the list is grouped under a heading per category.
  // Sorting by views (or oldest-first across categories) is one flat list, so each card carries its category instead.
  const categoryNames = [...new Set(posts.map((p) => p.category))];
  const grouped = !filters.category && filters.sort === 'newest' && categoryNames.length > 1;
  const groups: [string, PostMeta[]][] = grouped
    ? categoryNames.map((c) => [c, visiblePosts.filter((p) => p.category === c)] as [string, PostMeta[]]).filter(([, g]) => g.length > 0)
    : [['', visiblePosts]];

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

      {posts.length > 0 && <BlogFilters posts={posts} views={views} filters={filters} onChange={changeFilters} shown={visiblePosts.length} />}

      {posts.length === 0 ? (
        <div className="border border-dashed border-[var(--terminal-border)] rounded p-6 text-center font-mono text-sm text-[var(--terminal-text-dim)]">
          No posts yet.
        </div>
      ) : (
        // Keyed by the filter so the cards remount and each one is re-observed for its entrance.
        <div key={`${filters.category}|${filters.tags.join(",")}|${filters.sort}`} ref={listRef} className="flex flex-col gap-6 sm:gap-8">
          {groups.map(([category, group]) => (
            <section key={category || 'all'} aria-label={grouped ? category : undefined} className="flex flex-col gap-3 sm:gap-4">
              {grouped && (
                <h2 className="flex items-baseline gap-3 font-mono text-xs uppercase tracking-widest text-[var(--terminal-text-dim)]">
                  <span className="text-primary">{category}</span>
                  <span className="h-px flex-1 bg-[var(--terminal-border)]" aria-hidden="true" />
                  <span>{group.length}</span>
                </h2>
              )}
              {group.map((post, index) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  index={index}
                  views={views[post.slug]}
                  selected={post.slug === selectedSlug}
                  showCategory={!grouped && categoryNames.length > 1}
                  onOpen={openPost}
                />
              ))}
            </section>
          ))}
          {visiblePosts.length === 0 && (
            <div className="border border-dashed border-[var(--terminal-border)] rounded p-6 text-center font-mono text-sm text-[var(--terminal-text-dim)]">
              No posts match these filters.{' '}
              {isFiltered(filters) && <button type="button" onClick={() => changeFilters({ ...EMPTY_FILTERS, sort: filters.sort })} className="text-primary hover:underline">Clear filters</button>}
            </div>
          )}
        </div>
      )}
      </div>
      {ultrawide && (
        <UltrawideDetail label="POST">
          {selectedPost && <PostDetail post={selectedPost} views={views[selectedPost.slug]} body={openSlug === selectedPost.slug ? openBody : undefined} headings={openSlug === selectedPost.slug ? openHeadings : undefined} />}
        </UltrawideDetail>
      )}
    </PageShell>
  );
}
