import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

export interface PostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  tags?: string[];
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
}

export interface Post extends PostMeta {
  content: string;
}

function listMdxFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith('.mdx') || file.endsWith('.md'));
}

export function getAllPostSlugs(): string[] {
  return listMdxFiles().map((file) => file.replace(/\.mdx?$/, ''));
}

export function getPostBySlug(slug: string): Post | null {
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
    content,
  };
}

export function getAllPosts(): PostMeta[] {
  const posts: PostMeta[] = [];
  for (const slug of getAllPostSlugs()) {
    const post = getPostBySlug(slug);
    if (post) posts.push({ slug: post.slug, title: post.title, date: post.date, excerpt: post.excerpt, tags: post.tags });
  }
  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}
