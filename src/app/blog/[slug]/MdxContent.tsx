import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import type { AnchorHTMLAttributes, ComponentProps, ImgHTMLAttributes, ReactNode } from 'react';
import CodeBlock from '@/components/CodeBlock';
import { slugify } from '@/lib/blog';

function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (node && typeof node === 'object' && 'props' in node) return textOf((node.props as { children?: ReactNode }).children);
  return '';
}

// Headings get a stable id plus a hover-revealed `#` link so sections can be shared directly.
function anchored(Tag: 'h2' | 'h3', className: string) {
  return function AnchoredHeading({ children, ...props }: ComponentProps<'h2'>) {
    const id = slugify(textOf(children));
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

const mdxComponents = {
  h1: (props: ComponentProps<'h1'>) => <h1 className="text-2xl sm:text-3xl font-black font-mono text-[var(--terminal-text)] mt-8 mb-4 first:mt-0" {...props} />,
  h2: anchored('h2', 'text-xl sm:text-2xl font-bold font-mono text-primary mt-8 mb-3'),
  h3: anchored('h3', 'text-lg font-bold font-mono text-[var(--terminal-text)] mt-6 mb-2'),
  p: (props: ComponentProps<'p'>) => <p data-reveal className="scroll-reveal text-sm sm:text-base font-mono leading-relaxed text-[var(--terminal-text-muted)] mb-4" {...props} />,
  a: ({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
    href?.startsWith('/') ? (
      <Link href={href} className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors" {...props} />
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors" {...props} />
    ),
  ul: (props: ComponentProps<'ul'>) => <ul data-reveal className="scroll-reveal list-disc list-inside space-y-1.5 mb-4 font-mono text-sm text-[var(--terminal-text-muted)]" {...props} />,
  ol: (props: ComponentProps<'ol'>) => <ol data-reveal className="scroll-reveal list-decimal list-inside space-y-1.5 mb-4 font-mono text-sm text-[var(--terminal-text-muted)]" {...props} />,
  blockquote: (props: ComponentProps<'blockquote'>) => <blockquote data-reveal className="scroll-reveal border-l-2 border-primary pl-4 italic text-[var(--terminal-text-dim)] my-4" {...props} />,
  code: (props: ComponentProps<'code'>) => <code className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface-dark)] border border-[var(--terminal-border)] text-primary text-[0.85em] font-mono" {...props} />,
  pre: CodeBlock,
  hr: () => <hr data-reveal className="scroll-reveal border-[var(--terminal-border)] my-8" />,
  img: ({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element -- MDX content images have no known dimensions for next/image
    <img
      alt={alt ?? ''}
      data-reveal
      className="scroll-reveal w-full rounded border border-[var(--terminal-border)] my-4"
      loading="lazy"
      {...props}
    />
  ),
};

export default function MdxContent({ source }: { source: string }) {
  return <MDXRemote source={source} components={mdxComponents} />;
}
