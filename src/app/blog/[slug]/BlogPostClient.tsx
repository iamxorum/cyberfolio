'use client';

import type { ReactNode } from 'react';
import PageShell from '@/components/PageShell';
import Link from 'next/link';
import { useEffect } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import TableOfContents, { MIN_HEADINGS } from '@/components/TableOfContents';
import Reveal from '@/components/Reveal';
import ReadingProgress from '@/components/ReadingProgress';
import type { AdjacentPost, PostHeading, PostMeta, SeriesInfo } from '@/lib/blog';
import { formatDate } from '@/lib/format-date';
import { eventProps } from '@/lib/track';
import CopyLinkButton from '@/components/CopyLinkButton';
import { usePathname, useRouter } from 'next/navigation';

interface BlogPostClientProps {
  title: string;
  date: string;
  /** Set when the post was revised after publishing. */
  updated?: string;
  series: SeriesInfo | null;
  /** Optional TL;DR from the frontmatter. */
  summary?: string | string[];
  category?: string;
  tags?: string[];
  readingMinutes: number;
  headings: PostHeading[];
  previous: AdjacentPost | null;
  next: AdjacentPost | null;
  related: PostMeta[];
  /** Page views, when there are enough to show. */
  views?: number;
  children: ReactNode;
}

export default function BlogPostClient({ title, date, updated, series, summary, category, tags, readingMinutes, headings, previous, next, related, views, children }: BlogPostClientProps) {
  const articleRef = useScrollReveal<HTMLElement>();
  const pathname = usePathname();
  const router = useRouter();

  // Left and right arrows step to the older and newer post, unless the key belongs to a field, a dialog or scrollable code.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || e.defaultPrevented) return;
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable], [role="dialog"], dialog, pre')) return;
      const target = e.key === 'ArrowLeft' ? previous : next;
      if (!target) return;
      e.preventDefault();
      router.push(`/blog/${target.slug}`);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previous, next, router]);
  const points = typeof summary === 'string' ? [summary] : summary ?? [];

  return (
    <PageShell crumbs={[{ label: 'blog.log', href: '/blog' }]} width="narrow" gap="gap-6">
      <ReadingProgress minutes={readingMinutes} hasSidebar={headings.length >= MIN_HEADINGS} />
      <div className="flex flex-col gap-2 border-b border-[var(--terminal-border-alt)] pb-5">
        <h1 className="animate-reveal text-[var(--terminal-text)] text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight font-mono">
          {title}
        </h1>
        <div className="animate-reveal flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--terminal-text-dim)]" style={{ animationDelay: '130ms' }}>
          {category && (
            <Link href={`/blog?category=${encodeURIComponent(category)}`} className="px-1.5 py-0.5 rounded border border-primary text-primary text-[10px] uppercase tracking-wider transition-colors hover:bg-primary hover:text-[var(--terminal-bg)]">{category}</Link>
          )}
          {date && <time dateTime={date}>{formatDate(date)}</time>}
          {updated && updated !== date && <span>updated <time dateTime={updated}>{formatDate(updated)}</time></span>}
          <span>{readingMinutes} min read</span>
          {views && <span>{views.toLocaleString('en-US')} views</span>}
          <CopyLinkButton path={pathname} event="blog_link_copy" className="print:hidden" />
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <Link key={tag} href={`/blog/tag/${encodeURIComponent(tag)}`} className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface)] border border-[var(--terminal-border)] text-[10px] transition-colors hover:border-primary hover:text-primary">
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <TableOfContents headings={headings} variant="inline" />

      {/* The relative wrapper anchors the desktop outline in the right margin, level with the series box (or the first line). */}
      <div className="relative">
        <TableOfContents headings={headings} variant="sidebar" minutes={readingMinutes} />
        {points.length > 0 && (
          <aside aria-label="Summary" className="mb-6 rounded-r border-l-2 border-primary bg-[var(--terminal-surface-alt)] px-4 py-3 font-mono text-sm leading-relaxed text-[var(--terminal-text-muted)]">
            <p className="mb-1 text-[11px] font-bold tracking-widest text-primary">TL;DR</p>
            {points.length === 1 ? <p>{points[0]}</p> : <ul className="list-disc space-y-1 pl-5">{points.map((point) => <li key={point}>{point}</li>)}</ul>}
          </aside>
        )}
        {series && series.parts.length > 1 && (
          <details className="group print:hidden mb-6 rounded border border-[var(--terminal-border)] px-4 py-3 font-mono text-sm">
            <summary className="flex cursor-pointer select-none list-none items-center justify-between gap-3 text-xs tracking-widest text-[var(--terminal-text-dim)] transition-colors hover:text-primary">
              <span>SERIES · {series.name.toUpperCase()} · PART {series.current + 1} OF {series.parts.length}</span>
              <span className="material-symbols-outlined text-base transition-transform group-open:rotate-180" aria-hidden="true">expand_more</span>
            </summary>
            <ol className="mt-3 flex flex-col gap-1">
              {series.parts.map((part, i) => (
                <li key={part.slug} className="flex gap-2">
                  <span className="w-5 shrink-0 tabular-nums text-[var(--terminal-text-dim)]">{i + 1}.</span>
                  {i === series.current ? (
                    <span aria-current="page" className="font-bold text-primary">{part.title}</span>
                  ) : (
                    <Link href={`/blog/${part.slug}`} {...eventProps('blog_post_link_click', { kind: 'series', post: part.slug })} className="text-[var(--terminal-text-muted)] transition-colors hover:text-primary">{part.title}</Link>
                  )}
                </li>
              ))}
            </ol>
          </details>
        )}
        <article ref={articleRef} data-reading-target>{children}</article>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-posts" className="print:hidden flex flex-col gap-3 border-t border-[var(--terminal-border-alt)] pt-6 font-mono">
          <h2 id="related-posts" className="text-xs tracking-widest text-[var(--terminal-text-dim)]">RELATED_POSTS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {related.map((post) => (
              <Reveal key={post.slug} draw className="rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] hover:border-primary transition-colors">
                <Link href={`/blog/${post.slug}`} {...eventProps('blog_post_link_click', { kind: 'related', post: post.slug })} className="flex h-full flex-col gap-1 p-4">
                  <span className="text-sm font-bold text-[var(--terminal-text)]">{post.title}</span>
                  <span className="text-[10px] text-[var(--terminal-text-dim)]">{post.readingMinutes} min read</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {(previous || next) && (
        <nav aria-label="More posts" className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[var(--terminal-border-alt)] pt-6">
          {previous ? (
            <Reveal draw className="rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] hover:border-primary transition-colors">
              <Link href={`/blog/${previous.slug}`} {...eventProps('blog_post_link_click', { kind: 'previous', post: previous.slug })} className="flex flex-col gap-1 p-4 font-mono h-full">
                <span className="flex items-center gap-1 text-[10px] tracking-widest text-[var(--terminal-text-dim)]">
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_back</span>
                  PREVIOUS
                  <kbd aria-hidden="true" className="ml-1 hidden rounded border border-[var(--terminal-border)] px-1 leading-4 [@media(hover:hover)]:inline">←</kbd>
                </span>
                <span className="text-sm font-bold text-[var(--terminal-text)]">{previous.title}</span>
              </Link>
            </Reveal>
          ) : <div className="hidden sm:block" />}
          {next && (
            <Reveal draw delay={80} className="rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] hover:border-primary transition-colors">
              <Link href={`/blog/${next.slug}`} {...eventProps('blog_post_link_click', { kind: 'next', post: next.slug })} className="flex flex-col gap-1 p-4 font-mono h-full sm:text-right sm:items-end">
                <span className="flex items-center gap-1 text-[10px] tracking-widest text-[var(--terminal-text-dim)]">
                  <kbd aria-hidden="true" className="mr-1 hidden rounded border border-[var(--terminal-border)] px-1 leading-4 [@media(hover:hover)]:inline">→</kbd>
                  NEXT
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">arrow_forward</span>
                </span>
                <span className="text-sm font-bold text-[var(--terminal-text)]">{next.title}</span>
              </Link>
            </Reveal>
          )}
        </nav>
      )}
    </PageShell>
  );
}
