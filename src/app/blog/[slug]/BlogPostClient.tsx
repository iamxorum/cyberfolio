'use client';

import type { ReactNode } from 'react';
import PageShell from '@/components/PageShell';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import TableOfContents from '@/components/TableOfContents';
import Reveal from '@/components/Reveal';
import ReadingProgress from '@/components/ReadingProgress';
import type { AdjacentPost, PostHeading, PostMeta } from '@/lib/blog';
import { eventProps } from '@/lib/track';

interface BlogPostClientProps {
  title: string;
  date: string;
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

export default function BlogPostClient({ title, date, tags, readingMinutes, headings, previous, next, related, views, children }: BlogPostClientProps) {
  const articleRef = useScrollReveal<HTMLElement>();

  return (
    <PageShell crumbs={[{ label: 'blog.log', href: '/blog' }]} width="narrow" gap="gap-6">
      <ReadingProgress />
      <div className="flex flex-col gap-2 border-b border-[var(--terminal-border-alt)] pb-5">
        <h1 className="animate-reveal text-[var(--terminal-text)] text-2xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight font-mono">
          {title}
        </h1>
        <div className="animate-reveal flex flex-wrap items-center gap-3 text-xs font-mono text-[var(--terminal-text-dim)]" style={{ animationDelay: '130ms' }}>
          {date && <span>{date}</span>}
          <span>{readingMinutes} min read</span>
          {views && <span>{views.toLocaleString('en-US')} views</span>}
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
        <article ref={articleRef} data-reading-target>{children}</article>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-posts" className="flex flex-col gap-3 border-t border-[var(--terminal-border-alt)] pt-6 font-mono">
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
                </span>
                <span className="text-sm font-bold text-[var(--terminal-text)]">{previous.title}</span>
              </Link>
            </Reveal>
          ) : <div className="hidden sm:block" />}
          {next && (
            <Reveal draw delay={80} className="rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] hover:border-primary transition-colors">
              <Link href={`/blog/${next.slug}`} {...eventProps('blog_post_link_click', { kind: 'next', post: next.slug })} className="flex flex-col gap-1 p-4 font-mono h-full sm:text-right sm:items-end">
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
    </PageShell>
  );
}
