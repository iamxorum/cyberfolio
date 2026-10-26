import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { features } from '@/config';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

interface PostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  /** Single top-level section the post lives under (e.g. "Infra", "Football"); posts without one fall under DEFAULT_CATEGORY. */
  category?: string;
  tags?: string[];
  /** Set when a post is revised after publishing. */
  updated?: string;
  /** Name of the series this post belongs to; parts are ordered by date. */
  series?: string;
  /** A short TL;DR shown above the post: one string, or a list of points. */
  summary?: string | string[];
}

export interface PostMeta extends Omit<PostFrontmatter, 'category'> {
  /** Always set: posts without a category in their frontmatter get DEFAULT_CATEGORY. */
  category: string;
  slug: string;
  readingMinutes: number;
  /** 1-based position and size of the series, set by getAllPosts for posts in one. */
  seriesPart?: number;
  seriesTotal?: number;
}

interface Post extends PostMeta {
  content: string;
}

const WORDS_PER_MINUTE = 200;

export const DEFAULT_CATEGORY = 'General';

function readingMinutes(content: string): number {
  const words = content.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function listMdxFiles(): string[] {
  // With the blog switched off there are no posts anywhere: search, sitemap, RSS and static params all see none.
  if (!features.blog || !fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith('.mdx') || file.endsWith('.md'));
}

export const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Slugify that keeps ids unique within one document: a repeated heading becomes `name-2`, `name-3`, ... */
export function uniqueSlugger() {
  const used = new Set<string>();
  return (text: string) => {
    const base = slugify(text);
    if (!base) return '';
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  };
}

interface PostSearchEntry {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  headings: PostHeading[];
}

export interface PostHeading {
  text: string;
  id: string;
  /** 2 for `##`, 3 for `###`. */
  level: 2 | 3;
  /** Words between this heading and the next one, for the per-section reading time. */
  words: number;
}

// Strips inline markdown so heading text matches what MdxContent renders (and therefore its id).
const plainHeading = (raw: string) => raw.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '').trim();

export function extractHeadings(content: string) {
  const headings: PostHeading[] = [];
  const idFor = uniqueSlugger();
  let inFence = false;
  for (const line of content.split('\n')) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const match = inFence ? null : line.match(/^(#{2,3})\s+(.+?)\s*#*$/);
    if (!match) {
      const current = headings.at(-1);
      if (current) current.words += line.split(/\s+/).filter(Boolean).length;
      continue;
    }
    const text = plainHeading(match[2]);
    const id = idFor(text);
    if (id) headings.push({ text, id, level: match[1].length as 2 | 3, words: 0 });
  }
  return headings;
}

/** Light-weight index (titles, tags, headings) for the command palette; post bodies stay server-side. */
export function getSearchIndex(): PostSearchEntry[] {
  return getAllSlugsWithPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    tags: post.tags ?? [],
    headings: extractHeadings(post.content),
  }));
}

function getAllSlugsWithPosts(): Post[] {
  return getAllPostSlugs().map(getPostBySlug).filter((p): p is Post => p !== null).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getAllPostSlugs(): string[] {
  return listMdxFiles().map((file) => file.replace(/\.mdx?$/, ''));
}

// Slugs come straight from the URL, so they must never be able to name a file outside the content folder
// (`../../README` used to resolve to ../../README.md). Only plain file-name characters are accepted.
const SLUG_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

export function getPostBySlug(slug: string): Post | null {
  if (!features.blog || !SLUG_PATTERN.test(slug)) return null;
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;
  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? '',
    excerpt: data.excerpt ?? '',
    category: data.category ?? DEFAULT_CATEGORY,
    tags: data.tags ?? [],
    updated: data.updated,
    series: data.series,
    summary: data.summary,
    readingMinutes: readingMinutes(content),
    content,
  };
}

export interface AdjacentPost {
  slug: string;
  title: string;
}

/** `previous` is the next-older post, `next` the next-newer one (the list is newest first). */
export function getAdjacentPosts(slug: string): { previous: AdjacentPost | null; next: AdjacentPost | null } {
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return { previous: null, next: null };
  const pick = (p: PostMeta | undefined) => (p ? { slug: p.slug, title: p.title } : null);
  return { previous: pick(posts[index + 1]), next: pick(posts[index - 1]) };
}

export function getAllPosts(): PostMeta[] {
  const posts: PostMeta[] = [];
  for (const slug of getAllPostSlugs()) {
    const post = getPostBySlug(slug);
    if (post) posts.push({ slug: post.slug, title: post.title, date: post.date, excerpt: post.excerpt, category: post.category, tags: post.tags, updated: post.updated, series: post.series, readingMinutes: post.readingMinutes });
  }
  // Series parts are numbered oldest first, whatever order the list is returned in.
  const bySeries = new Map<string, PostMeta[]>();
  for (const post of posts) if (post.series) bySeries.set(post.series, [...(bySeries.get(post.series) ?? []), post]);
  for (const parts of bySeries.values()) {
    parts.sort((a, b) => (a.date < b.date ? -1 : 1)).forEach((part, i) => { part.seriesPart = i + 1; part.seriesTotal = parts.length; });
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export interface SeriesInfo {
  name: string;
  parts: AdjacentPost[];
  /** 0-based index of the current post in `parts`. */
  current: number;
}

/** The series `slug` belongs to, with every part oldest first; null for a standalone post. */
export function getSeries(slug: string): SeriesInfo | null {
  const posts = getAllPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post?.series) return null;
  const parts = posts.filter((p) => p.series === post.series).reverse().map((p) => ({ slug: p.slug, title: p.title }));
  return { name: post.series, parts, current: parts.findIndex((p) => p.slug === slug) };
}

/** Every tag used by at least one post. */
export function getAllTags(): string[] {
  return [...new Set(getAllPosts().flatMap((post) => post.tags ?? []))].sort();
}

/** Posts sharing the most tags with `slug` (at least one), newest first among equals. */
export function getRelatedPosts(slug: string, limit = 2): PostMeta[] {
  const posts = getAllPosts();
  const current = posts.find((post) => post.slug === slug);
  if (!current?.tags?.length) return [];

  const currentTags = new Set(current.tags);
  const shared = (post: PostMeta) => post.tags?.filter((tag) => currentTags.has(tag)).length ?? 0;
  return posts
    .filter((post) => post.slug !== slug && shared(post) > 0)
    .sort((a, b) => shared(b) - shared(a))
    .slice(0, limit);
}
