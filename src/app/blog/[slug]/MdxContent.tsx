import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { Children, cloneElement, isValidElement, type AnchorHTMLAttributes, type ComponentProps, type ImgHTMLAttributes, type ReactNode } from 'react';
import CodeBlock from '@/components/CodeBlock';
import ZoomImage from '@/components/ZoomImage';
import { uniqueSlugger } from '@/lib/blog';

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node && typeof node === 'object' && 'props' in node) return textOf((node.props as { children?: ReactNode }).children);
  return '';
}

interface MdNode {
  type: string;
  meta?: string | null;
  data?: Record<string, unknown>;
  children?: MdNode[];
}

// Turns a fence's info string (```yaml title="traefik.yml" {2,4-6}) into props on the rendered <pre>.
function codeMeta() {
  const walk = (node: MdNode) => {
    if (node.type === 'code' && node.meta) {
      const props: Record<string, string> = {};
      const title = node.meta.match(/title=(?:"([^"]*)"|'([^']*)')/);
      const lines = node.meta.match(/\{([\d,\s-]+)\}/);
      if (title) props['data-title'] = title[1] ?? title[2];
      if (lines) props['data-highlight'] = lines[1].replace(/\s/g, '');
      if (Object.keys(props).length) node.data = { ...node.data, hProperties: props };
    }
    node.children?.forEach(walk);
  };
  return walk;
}

const CALLOUTS = {
  NOTE: { label: 'NOTE', color: 'text-blue-400' },
  TIP: { label: 'TIP', color: 'text-green-400' },
  IMPORTANT: { label: 'IMPORTANT', color: 'text-orange-400' },
  WARNING: { label: 'WARNING', color: 'text-yellow-400' },
  CAUTION: { label: 'CAUTION', color: 'text-red-400' },
} as const;

// GitHub-style alert: a quote whose first line is [!NOTE], [!TIP], [!IMPORTANT], [!WARNING] or [!CAUTION].
function Blockquote({ children, ...props }: ComponentProps<'blockquote'>) {
  const blocks = Children.toArray(children).filter((child) => typeof child !== 'string' || child.trim());
  const first = blocks[0];
  if (isValidElement<{ children?: ReactNode }>(first)) {
    const inner = Children.toArray(first.props.children);
    const head = typeof inner[0] === 'string' ? /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/i.exec(inner[0]) : null;
    if (head) {
      const kind = CALLOUTS[head[1].toUpperCase() as keyof typeof CALLOUTS];
      const rest = [(inner[0] as string).slice(head[0].length), ...inner.slice(1)].filter((part) => part !== '');
      return (
        <aside data-reveal role="note" aria-label={kind.label.toLowerCase()} className={`scroll-reveal my-4 rounded-r border-l-2 border-current bg-[var(--terminal-surface-alt)] px-4 py-3 ${kind.color}`}>
          <p className="mb-1 font-mono text-[11px] font-bold tracking-widest">{kind.label}</p>
          <div className="font-mono text-sm leading-relaxed text-[var(--terminal-text-muted)] [&>p]:mb-2 [&>p:last-child]:mb-0">
            {rest.length > 0 && cloneElement(first, undefined, ...rest)}
            {blocks.slice(1)}
          </div>
        </aside>
      );
    }
  }
  return <blockquote data-reveal className="scroll-reveal border-l-2 border-primary pl-4 italic text-[var(--terminal-text-dim)] my-4" {...props}>{children}</blockquote>;
}

const Img = ({ src, alt }: ImgHTMLAttributes<HTMLImageElement>) => (typeof src === 'string' ? <ZoomImage src={src} alt={alt ?? ''} /> : null);

// Headings get a stable id plus a hover-revealed `#` link so sections can be shared directly.
// `idFor` is shared by every heading of one post, in document order, so repeated titles get distinct ids
// that match the ones extractHeadings gives the table of contents.
function anchored(Tag: 'h2' | 'h3', className: string, idFor: (text: string) => string) {
  return function AnchoredHeading({ children, ...props }: ComponentProps<'h2'>) {
    const id = idFor(textOf(children));
    return (
      <Tag id={id || undefined} data-reveal className={`scroll-reveal group scroll-mt-32 ${className}`} {...props}>
        {children}
        {id && (
          <a href={`#${id}`} aria-label={`Link to section: ${textOf(children)}`} className="ml-2 text-primary opacity-40 sm:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity no-underline">
            #
          </a>
        )}
      </Tag>
    );
  };
}

const buildComponents = () => {
  const idFor = uniqueSlugger();
  return {
  h1: (props: ComponentProps<'h1'>) => <h1 className="text-2xl sm:text-3xl font-black font-mono text-[var(--terminal-text)] mt-8 mb-4 first:mt-0" {...props} />,
  h2: anchored('h2', 'text-xl sm:text-2xl font-bold font-mono text-primary mt-8 mb-3', idFor),
  h3: anchored('h3', 'text-lg font-bold font-mono text-[var(--terminal-text)] mt-6 mb-2', idFor),
  // A lone image is a figure, which can't live inside a <p>.
  p: ({ children, ...props }: ComponentProps<'p'>) =>
    Children.toArray(children).some((child) => isValidElement(child) && child.type === Img) ? (
      <>{children}</>
    ) : (
      <p data-reveal className="scroll-reveal text-sm sm:text-base font-mono leading-relaxed text-[var(--terminal-text-muted)] mb-4" {...props}>{children}</p>
    ),
  a: ({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
    href?.startsWith('/') ? (
      <Link href={href} className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors" {...props} />
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors" {...props} />
    ),
  ul: (props: ComponentProps<'ul'>) => <ul data-reveal className="scroll-reveal list-disc list-inside space-y-1.5 mb-4 font-mono text-sm text-[var(--terminal-text-muted)]" {...props} />,
  ol: (props: ComponentProps<'ol'>) => <ol data-reveal className="scroll-reveal list-decimal list-inside space-y-1.5 mb-4 font-mono text-sm text-[var(--terminal-text-muted)]" {...props} />,
  blockquote: Blockquote,
  code: (props: ComponentProps<'code'>) => <code className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface-dark)] border border-[var(--terminal-border)] text-primary text-[0.85em] font-mono" {...props} />,
  pre: CodeBlock,
  hr: () => <hr data-reveal className="scroll-reveal border-[var(--terminal-border)] my-8" />,
  table: (props: ComponentProps<'table'>) => (
    <div data-reveal className="scroll-reveal mb-4 overflow-x-auto rounded border border-[var(--terminal-border)]">
      <table className="w-full border-collapse text-left font-mono text-sm" {...props} />
    </div>
  ),
  th: (props: ComponentProps<'th'>) => <th className="border-b border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] px-3 py-2 font-bold text-[var(--terminal-text)]" {...props} />,
  td: (props: ComponentProps<'td'>) => <td className="border-b border-[var(--terminal-border-alt)] px-3 py-2 align-top text-[var(--terminal-text-muted)]" {...props} />,
  del: (props: ComponentProps<'del'>) => <del className="text-[var(--terminal-text-dim)]" {...props} />,
  img: Img,
  };
};

export default function MdxContent({ source }: { source: string }) {
  return <MDXRemote source={source} components={buildComponents()} options={{ mdxOptions: { remarkPlugins: [remarkGfm, codeMeta] } }} />;
}
