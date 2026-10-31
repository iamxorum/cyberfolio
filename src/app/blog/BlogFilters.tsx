'use client';

import { useEffect, useRef, useState } from 'react';
import { track } from '@/lib/track';
import type { PostMeta } from '@/lib/blog';
import { EMPTY_FILTERS, isFiltered, matchesCategory, matchesQuery, matchesTags, type FilterState, type SortKey } from './filters';

const SORT_LABELS: Record<SortKey, string> = { newest: 'Newest', oldest: 'Oldest', views: 'Most viewed' };
const COLLAPSED_TAGS = 8;

const countBy = (posts: PostMeta[], keys: (p: PostMeta) => string[]) => {
  const counts = new Map<string, number>();
  for (const post of posts) for (const key of keys(post)) counts.set(key, (counts.get(key) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
};

interface BlogFiltersProps {
  posts: PostMeta[];
  views: Record<string, number>;
  filters: FilterState;
  onChange: (next: FilterState) => void;
  shown: number;
}

// One bar, three jobs in a fixed order: where (category tabs), what (search + sort), which topics (tag chips).
// Not a card, so none of it reads as a post. Press feedback is instant (active:scale), targets are 40px+.
export default function BlogFilters({ posts, views, filters, onChange, shown }: BlogFiltersProps) {
  const [allTags, setAllTags] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // `/` jumps to the search field, unless the key is going to a field or is part of a shortcut.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || e.defaultPrevented) return;
      if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable], [role="dialog"]')) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const set = (patch: Partial<FilterState>) => onChange({ ...filters, ...patch });

  // Counts are taken against the *other* filters, so a number is what picking that entry would give.
  const allCategories = countBy(posts, (p) => [p.category]);
  const categoryCounts = new Map(countBy(posts.filter((p) => matchesQuery(p, filters.query) && matchesTags(p, filters.tags)), (p) => [p.category]));
  const tags = countBy(posts.filter((p) => matchesQuery(p, filters.query) && matchesCategory(p, filters.category)), (p) => p.tags ?? []);
  // A selected tag stays listed even if the current category has none, so it can be undone.
  const listed = new Set(tags.map(([t]) => t));
  for (const tag of filters.tags) if (!listed.has(tag)) tags.push([tag, 0]);
  const selectedTags = new Set(filters.tags);

  const visibleTags = allTags ? tags : tags.filter(([tag], i) => i < COLLAPSED_TAGS || selectedTags.has(tag));
  const hiddenCount = tags.length - visibleTags.length;
  const hasViews = Object.keys(views).length > 0;
  const total = [...categoryCounts.values()].reduce((a, b) => a + b, 0);
  const filtered = isFiltered(filters);

  const pickCategory = (category: string | null) => { track('blog_category_filter', { category: category ?? 'all' }); set({ category }); };
  const toggleTag = (tag: string) => {
    const on = filters.tags.includes(tag);
    track('blog_tag_filter', { tag: on ? 'all' : tag });
    set({ tags: on ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag] });
  };
  const reset = () => { track('blog_filters_clear'); onChange({ ...EMPTY_FILTERS, sort: filters.sort }); };

  const tab = (on: boolean) =>
    `shrink-0 whitespace-nowrap flex items-center gap-2 px-3.5 min-h-11 -mb-px border-b-2 text-sm transition-[color,border-color,transform] duration-150 active:scale-[0.97] ${on ? 'border-primary text-primary font-bold' : 'border-transparent text-[var(--terminal-text-muted)] hover:text-[var(--terminal-text)]'}`;
  const count = (on: boolean) =>
    `rounded px-1.5 py-0.5 text-xs leading-none tabular-nums transition-colors ${on ? 'bg-primary text-[var(--terminal-bg)]' : 'bg-[var(--terminal-surface-alt)] text-[var(--terminal-text-dim)]'}`;
  const chip = (on: boolean) =>
    `inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-2.5 min-h-8 text-xs transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.96] ${on ? 'border-primary bg-primary text-[var(--terminal-bg)] font-bold' : 'border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary'}`;
  const field = 'flex items-center gap-2 rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] px-3 min-h-11 text-[var(--terminal-text-dim)] transition-colors focus-within:border-primary hover:border-[var(--terminal-text-dim)] focus-within:hover:border-primary';

  return (
    <section aria-label="Filter posts" className="flex flex-col gap-4 font-mono text-xs">
      {allCategories.length > 1 && (
        <div role="group" aria-label="Category" className="flex overflow-x-auto border-b border-[var(--terminal-border)] [scrollbar-width:none]">
          <button type="button" aria-pressed={filters.category === null} onClick={() => pickCategory(null)} className={tab(filters.category === null)}>
            All <span className={count(filters.category === null)}>{total}</span>
          </button>
          {allCategories.map(([category]) => {
            const on = filters.category === category;
            return (
              <button key={category} type="button" aria-pressed={on} onClick={() => pickCategory(category)} className={tab(on)}>
                {category} <span className={count(on)}>{categoryCounts.get(category) ?? 0}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className={`${field} sm:flex-1`}>
          <span className="material-symbols-outlined text-lg" aria-hidden="true">search</span>
          <span className="sr-only">Search posts</span>
          <input
            ref={searchRef}
            type="search"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            placeholder="Search title, topic or tag"
            className="w-full bg-transparent text-sm text-[var(--terminal-text)] placeholder:text-[var(--terminal-text-dim)] focus:outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {!filters.query && (
            <kbd aria-hidden="true" className="hidden rounded border border-[var(--terminal-border)] px-1.5 py-0.5 text-xs leading-none [@media(hover:hover)]:block">/</kbd>
          )}
          {filters.query && (
            <button type="button" aria-label="Clear search" onClick={() => set({ query: '' })} className="-mr-1 grid size-7 place-items-center rounded hover:text-primary active:scale-90 transition-[color,transform]">
              <span className="material-symbols-outlined text-base" aria-hidden="true">close</span>
            </button>
          )}
        </label>
        <label className={`${field} sm:w-auto`}>
          <span className="material-symbols-outlined text-lg" aria-hidden="true">sort</span>
          <span className="sr-only">Sort by</span>
          <select
            value={filters.sort}
            onChange={(e) => { track('blog_sort', { sort: e.target.value }); set({ sort: e.target.value as SortKey }); }}
            className="w-full cursor-pointer bg-transparent py-2 text-sm text-[var(--terminal-text)] focus:outline-none"
          >
            {(Object.keys(SORT_LABELS) as SortKey[]).filter((k) => k !== 'views' || hasViews).map((key) => (
              <option key={key} value={key}>{SORT_LABELS[key]}</option>
            ))}
          </select>
        </label>
      </div>

      {tags.length > 0 && (
        <div role="group" aria-label="Tags (match any)" className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[var(--terminal-text-dim)]">Topics</span>
          {visibleTags.map(([tag, n]) => {
            const on = selectedTags.has(tag);
            return (
              <button key={tag} type="button" aria-pressed={on} onClick={() => toggleTag(tag)} className={chip(on)}>
                {tag}
                <span className={`tabular-nums ${on ? 'opacity-80' : 'text-[var(--terminal-text-dim)]'}`}>{n}</span>
              </button>
            );
          })}
          {tags.length > COLLAPSED_TAGS && (
            <button type="button" aria-expanded={allTags} onClick={() => setAllTags(!allTags)} className="inline-flex min-h-8 items-center px-1.5 whitespace-nowrap text-[var(--terminal-text-dim)] hover:text-primary transition-colors">
              {allTags ? 'Show less' : `Show ${hiddenCount} more`}
            </button>
          )}
        </div>
      )}

      <div className="flex min-h-6 items-center justify-between gap-3 text-[var(--terminal-text-dim)]" aria-live="polite">
        <span className="flex flex-wrap items-center gap-x-4">
          <span>{filtered ? `${shown} of ${posts.length} posts` : `${posts.length} ${posts.length === 1 ? 'post' : 'posts'}`}</span>
          <span aria-hidden="true" className="hidden opacity-60 [@media(hover:hover)]:inline">j/k move · enter open · / search</span>
        </span>
        {filtered && (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1 whitespace-nowrap text-primary hover:underline underline-offset-4 active:opacity-70">
            Clear all <span className="material-symbols-outlined text-sm" aria-hidden="true">close</span>
          </button>
        )}
      </div>
    </section>
  );
}
