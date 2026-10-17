import { ImageResponse } from 'next/og';
import type { ReactNode } from 'react';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { siteConfig } from '@/config';

const SIZE = { width: 1200, height: 630 };

async function loadFonts() {
  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), 'public/og-fonts/JetBrainsMono-Regular.ttf')),
    readFile(join(process.cwd(), 'public/og-fonts/JetBrainsMono-Bold.ttf')),
  ]);
  return [
    { name: 'JetBrains Mono', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'JetBrains Mono', data: bold, weight: 700 as const, style: 'normal' as const },
  ];
}

// Terminal-window frame shared by every social card.
function frame(content: ReactNode) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: '#141022',
        padding: '48px',
        fontFamily: 'JetBrains Mono',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          border: '2px solid #337b73',
          borderRadius: '12px',
          padding: '56px',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', position: 'absolute', top: '28px', right: '32px' }}>
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#eab308' }} />
          <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
        </div>

        {content}

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', color: '#919256', fontSize: 22 }}>
            {siteConfig.domain}
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateSocialImage() {
  const fonts = await loadFonts();

  return new ImageResponse(
    frame(
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
        <div style={{ display: 'flex', color: '#b0a61a', fontSize: 28, marginBottom: 24 }}>
          {`root@${siteConfig.username}:~$ whoami`}
        </div>
        <div style={{ display: 'flex', color: '#ffffff', fontSize: 76, fontWeight: 700, marginBottom: 16 }}>
          {siteConfig.fullName}
        </div>
        <div style={{ display: 'flex', color: '#f2df0d', fontSize: 34, marginBottom: 8 }}>
          {siteConfig.role}
        </div>
        <div style={{ display: 'flex', color: '#919256', fontSize: 24 }}>
          {`${siteConfig.location} · ${siteConfig.status}`}
        </div>
      </div>,
    ),
    { ...SIZE, fonts },
  );
}

interface ContentImageInput {
  /** Shell prompt line, e.g. `user@blog:~$ cat post.mdx`. */
  prompt: string;
  title: string;
  meta?: string;
  tags?: string[];
}

// Long titles shrink so they stay within three lines of the card.
const titleSize = (title: string) => (title.length > 80 ? 48 : title.length > 55 ? 56 : title.length > 35 ? 64 : 72);

export async function generateContentImage({ prompt, title, meta, tags = [] }: ContentImageInput) {
  const fonts = await loadFonts();

  return new ImageResponse(
    frame(
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
        <div style={{ display: 'flex', color: '#b0a61a', fontSize: 26, marginBottom: 28 }}>
          {prompt}
        </div>
        <div style={{ display: 'flex', color: '#ffffff', fontSize: titleSize(title), fontWeight: 700, lineHeight: 1.15, marginBottom: 28 }}>
          {title}
        </div>
        {meta && (
          <div style={{ display: 'flex', color: '#f2df0d', fontSize: 26, marginBottom: 20 }}>
            {meta}
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {tags.slice(0, 4).map((tag) => (
            <div
              key={tag}
              style={{ display: 'flex', color: '#919256', fontSize: 22, border: '1px solid #337b73', borderRadius: '6px', padding: '4px 14px' }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>,
    ),
    { ...SIZE, fonts },
  );
}

interface PostImageInput {
  title: string;
  date?: string;
  tags?: string[];
  readingMinutes?: number;
}

export function generatePostImage({ title, date, tags = [], readingMinutes }: PostImageInput) {
  return generateContentImage({
    prompt: `${siteConfig.username}@blog:~$ cat post.mdx`,
    title,
    meta: [date, readingMinutes ? `${readingMinutes} min read` : null].filter(Boolean).join(' · '),
    tags: tags.map((tag) => `#${tag}`),
  });
}
