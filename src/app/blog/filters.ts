import type { PostMeta } from '@/lib/blog';

export type SortKey = 'newest' | 'oldest' | 'views';

export interface FilterState {
  query: string;
  category: string | null;
  /** A post matches when it has at least one of these. */
  tags: string[];
  sort: SortKey;
}

export const EMPTY_FILTERS: FilterState = { query: '', category: null, tags: [], sort: 'newest' };

export const matchesQuery = (post: PostMeta, query: string) => {
  const q = query.trim().toLowerCase();
  return !q || `${post.title} ${post.excerpt} ${post.category} ${(post.tags ?? []).join(' ')}`.toLowerCase().includes(q);
};
export const matchesCategory = (post: PostMeta, category: string | null) => !category || post.category === category;
export const matchesTags = (post: PostMeta, tags: string[]) => tags.length === 0 || tags.some((tag) => post.tags?.includes(tag));

export const isFiltered = (f: FilterState) => f.query.trim() !== '' || f.category !== null || f.tags.length > 0;

export function applyFilters(posts: PostMeta[], f: FilterState, views: Record<string, number>): PostMeta[] {
  const matching = posts.filter((p) => matchesQuery(p, f.query) && matchesCategory(p, f.category) && matchesTags(p, f.tags));
  const byDate = (a: PostMeta, b: PostMeta) => (a.date < b.date ? 1 : -1);
  if (f.sort === 'oldest') return matching.sort((a, b) => byDate(b, a));
  if (f.sort === 'views') return matching.sort((a, b) => (views[b.slug] ?? 0) - (views[a.slug] ?? 0) || byDate(a, b));
  return matching.sort(byDate);
}

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Reads `?category=&tag=a,b&q=&sort=`; unknown values are ignored rather than trusted. */
export function parseFilters(params: Record<string, string | string[] | undefined>): FilterState {
  const sort = first(params.sort);
  return {
    query: first(params.q)?.slice(0, 100) ?? '',
    category: first(params.category) || null,
    tags: first(params.tag)?.split(',').filter(Boolean).slice(0, 10) ?? [],
    sort: sort === 'oldest' || sort === 'views' ? sort : 'newest',
  };
}

/** The query string for the filters, plus an open post when there is one. Defaults are left out. */
export function filtersToSearch(f: FilterState, post?: string | null): string {
  const params = new URLSearchParams();
  if (f.category) params.set('category', f.category);
  if (f.tags.length) params.set('tag', f.tags.join(','));
  if (f.query.trim()) params.set('q', f.query.trim());
  if (f.sort !== 'newest') params.set('sort', f.sort);
  if (post) params.set('post', post);
  const search = params.toString();
  return search ? `?${search}` : '';
}
