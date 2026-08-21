import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { siteConfig } from '@/config';

export async function generateSocialImage() {
  const [regular, bold] = await Promise.all([
    readFile(join(process.cwd(), 'public/og-fonts/JetBrainsMono-Regular.ttf')),
    readFile(join(process.cwd(), 'public/og-fonts/JetBrainsMono-Bold.ttf')),
  ]);

  return new ImageResponse(
    (
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
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', color: '#919256', fontSize: 22 }}>
              {siteConfig.domain}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'JetBrains Mono', data: regular, weight: 400, style: 'normal' },
        { name: 'JetBrains Mono', data: bold, weight: 700, style: 'normal' },
      ],
    }
  );
}
