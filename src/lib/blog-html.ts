import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { siteUrl } from '@/lib/seo';

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

// A feed reader has no site to resolve `/blog/x.png` against, so root-relative links and images are made absolute.
function absoluteUrls() {
  const fix = (node: HastNode) => {
    for (const key of ['src', 'href']) {
      const value = node.properties?.[key];
      if (node.properties && typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) node.properties[key] = `${siteUrl}${value}`;
    }
    node.children?.forEach(fix);
  };
  return fix;
}

const CALLOUT = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*\n?/i;

// A feed reader can't show the styled callout box, so `> [!WARNING]` becomes a quote that opens with a bold "Warning:".
function callouts() {
  const fix = (node: HastNode) => {
    if (node.tagName === 'blockquote') {
      const paragraph = node.children?.find((child) => child.tagName === 'p');
      const first = paragraph?.children?.[0];
      const match = first?.type === 'text' ? CALLOUT.exec(first.value ?? '') : null;
      if (paragraph?.children && first && match) {
        const label = `${match[1][0]}${match[1].slice(1).toLowerCase()}:`;
        paragraph.children[0] = { type: 'element', tagName: 'strong', properties: {}, children: [{ type: 'text', value: label }] };
        paragraph.children.splice(1, 0, { type: 'text', value: ` ${(first.value ?? '').slice(match[0].length)}` });
      }
    }
    node.children?.forEach(fix);
  };
  return fix;
}

/** A post's markdown as static HTML for the RSS feed. Raw HTML in the source is dropped, not passed through. */
export async function markdownToHtml(source: string): Promise<string> {
  const file = await unified().use(remarkParse).use(remarkGfm).use(remarkRehype).use(callouts).use(absoluteUrls).use(rehypeStringify).process(source);
  return String(file);
}
