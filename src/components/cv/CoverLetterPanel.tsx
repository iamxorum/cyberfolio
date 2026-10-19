'use client';

import { useState } from 'react';
import CoverLetterPreview from '@/components/CoverLetterPreview';
import ScaleToFit from '@/components/ScaleToFit';
import StyleSelectorGrid from '@/components/cv/StyleSelectorGrid';
import ViewToggleButton from '@/components/cv/ViewToggleButton';
import RevealContainer from '@/components/cv/RevealContainer';
import DownloadButton from '@/components/cv/DownloadButton';
import { usePdfDownload } from '@/hooks/usePdfDownload';
import { coverLetterConfig, siteConfig } from '@/config';
import Reveal from '@/components/Reveal';
import TypedText from '@/components/TypedText';

export default function CoverLetterPanel({ email }: { email?: string }) {
  const [selectedLetterStyle, setSelectedLetterStyle] = useState<string>(coverLetterConfig.styles[0].id);
  const [showLetter, setShowLetter] = useState<boolean>(true);
  const { isDownloading, succeeded, download } = usePdfDownload();

  const selectedCoverLetterStyle = coverLetterConfig.styles.find(s => s.id === selectedLetterStyle) || coverLetterConfig.styles[0];

  const handleDownloadLetter = () => download(async () => {
    const [{ pdf }, { default: CoverLetterDocument }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('@/components/CoverLetterDocument'),
    ]);
    const blob = await pdf(
      <CoverLetterDocument siteConfig={siteConfig} style={selectedCoverLetterStyle} email={email} />
    ).toBlob();
    return { blob, filename: `${siteConfig.fullName.replace(/\s+/g, '_')}_Cover_Letter_${selectedLetterStyle}.pdf` };
  });

  return (
    <>
      <Reveal draw className="mb-6 p-4 sm:p-6 rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface)] no-print">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[var(--terminal-text)] text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.015em] font-mono mb-2">
              <span className="text-primary">&gt;</span> <TypedText text="LETTER_DOWNLOAD.sh" />
            </h1>
            <p className="text-[var(--terminal-text-dim)] text-sm font-mono">
              Select a cover letter style for your target job domain
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <DownloadButton isDownloading={isDownloading} succeeded={succeeded} onClick={handleDownloadLetter} />
          </div>
        </div>

        <StyleSelectorGrid styles={coverLetterConfig.styles} selectedId={selectedLetterStyle} onSelect={setSelectedLetterStyle} />

        <ViewToggleButton visible={showLetter} onToggle={() => setShowLetter(!showLetter)} label="LETTER" />
      </Reveal>

      <Reveal>
      <RevealContainer visible={showLetter}>
        <ScaleToFit>
          <CoverLetterPreview
            siteConfig={siteConfig}
            style={selectedCoverLetterStyle}
            email={email}
          />
        </ScaleToFit>
      </RevealContainer>
      </Reveal>
    </>
  );
}
