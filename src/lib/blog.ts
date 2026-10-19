import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { features } from '@/config';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

interface PostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  tags?: string[];
  /** Set when a post is revised after publishing. */
  updated?: string;
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
  readingMinutes: number;
}

interface Post extends PostMeta {
  content: string;
}

const WORDS_PER_MINUTE = 200;

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

interface PostSearchEntry {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  headings: PostHeading[];
}

export interface PostHeading {
  text: string;
  id: string;
  /** 2 for `##`, 3 for `###`. */
  level: 2 | 3;
}

// Strips inline markdown so heading text matches what MdxContent renders (and therefore its id).
const plainHeading = (raw: string) => raw.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '').trim();

export function extractHeadings(content: string) {
  const headings: PostHeading[] = [];
  let inFence = false;
  for (const line of content.split('\n')) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const match = line.match(/^(#{2,3})\s+(.+?)\s*#*$/);
    if (!match) continue;
    const text = plainHeading(match[2]);
    const id = slugify(text);
    if (id) headings.push({ text, id, level: match[1].length as 2 | 3 });
  }
  return headings;
}

/** Light-weight index (titles, tags, headings) for the command palette; post bodies stay server-side. */
export function getSearchIndex(): PostSearchEntry[] {
  return getAllSlugsWithPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
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
    tags: data.tags ?? [],
    updated: data.updated,
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
    if (post) posts.push({ slug: post.slug, title: post.title, date: post.date, excerpt: post.excerpt, tags: post.tags, updated: post.updated, readingMinutes: post.readingMinutes });
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
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
