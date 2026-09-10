import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import type { AnchorHTMLAttributes, ComponentProps, ImgHTMLAttributes } from 'react';

const mdxComponents = {
  h1: (props: ComponentProps<'h1'>) => <h1 className="text-2xl sm:text-3xl font-black font-mono text-[var(--terminal-text)] mt-8 mb-4 first:mt-0" {...props} />,
  h2: (props: ComponentProps<'h2'>) => <h2 className="text-xl sm:text-2xl font-bold font-mono text-primary mt-8 mb-3" {...props} />,
  h3: (props: ComponentProps<'h3'>) => <h3 className="text-lg font-bold font-mono text-[var(--terminal-text)] mt-6 mb-2" {...props} />,
  p: (props: ComponentProps<'p'>) => <p className="text-sm sm:text-base font-mono leading-relaxed text-[var(--terminal-text-muted)] mb-4" {...props} />,
  a: ({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) =>
    href?.startsWith('/') ? (
      <Link href={href} className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors" {...props} />
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors" {...props} />
    ),
  ul: (props: ComponentProps<'ul'>) => <ul className="list-disc list-inside space-y-1.5 mb-4 font-mono text-sm text-[var(--terminal-text-muted)]" {...props} />,
  ol: (props: ComponentProps<'ol'>) => <ol className="list-decimal list-inside space-y-1.5 mb-4 font-mono text-sm text-[var(--terminal-text-muted)]" {...props} />,
  blockquote: (props: ComponentProps<'blockquote'>) => <blockquote className="border-l-2 border-primary pl-4 italic text-[var(--terminal-text-dim)] my-4" {...props} />,
  code: (props: ComponentProps<'code'>) => <code className="px-1.5 py-0.5 rounded bg-[var(--terminal-surface-dark)] border border-[var(--terminal-border)] text-primary text-[0.85em] font-mono" {...props} />,
  pre: (props: ComponentProps<'pre'>) => <pre className="rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg-dark)] p-4 overflow-x-auto mb-4 text-[13px] leading-relaxed [&>code]:bg-transparent [&>code]:border-0 [&>code]:p-0" {...props} />,
  hr: () => <hr className="border-[var(--terminal-border)] my-8" />,
  img: ({ alt, ...props }: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element -- MDX content images have no known dimensions for next/image
    <img
      alt={alt ?? ''}
      className="w-full rounded border border-[var(--terminal-border)] my-4"
      loading="lazy"
      {...props}
    />
  ),
};

export default function MdxContent({ source }: { source: string }) {
  return <MDXRemote source={source} components={mdxComponents} />;
}
