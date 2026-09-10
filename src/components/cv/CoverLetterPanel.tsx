'use client';

import { useState } from 'react';
import CoverLetterPreview from '@/components/CoverLetterPreview';
import ScaleToFit from '@/components/ScaleToFit';
import StyleSelectorGrid from '@/components/cv/StyleSelectorGrid';
import ViewToggleButton from '@/components/cv/ViewToggleButton';
import RevealContainer from '@/components/cv/RevealContainer';
import { downloadBlob } from '@/lib/download-blob';
import { coverLetterConfig, siteConfig } from '@/config';

export default function CoverLetterPanel() {
  const [selectedLetterStyle, setSelectedLetterStyle] = useState<string>(coverLetterConfig.styles[0].id);
  const [isDownloadingLetter, setIsDownloadingLetter] = useState(false);
  const [showLetter, setShowLetter] = useState<boolean>(false);

  const selectedCoverLetterStyle = coverLetterConfig.styles.find(s => s.id === selectedLetterStyle) || coverLetterConfig.styles[0];

  const handleDownloadLetter = async () => {
    setIsDownloadingLetter(true);

    try {
      const [{ pdf }, { default: CoverLetterDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/CoverLetterDocument'),
      ]);

      const blob = await pdf(
        <CoverLetterDocument
          siteConfig={siteConfig}
          style={selectedCoverLetterStyle}
          email={coverLetterConfig.email}
        />
      ).toBlob();

      downloadBlob(blob, `${siteConfig.fullName.replace(/\s+/g, '_')}_Cover_Letter_${selectedLetterStyle}.pdf`);
    } finally {
      setIsDownloadingLetter(false);
    }
  };

  return (
    <>
      {/* Cover Letter Style Selector | independent from CV styles */}
      <div className="mb-6 p-4 sm:p-6 rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface)] no-print">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[var(--terminal-text)] text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.015em] font-mono mb-2">
              <span className="text-primary">&gt;</span> LETTER_DOWNLOAD.sh
            </h1>
            <p className="text-[var(--terminal-text-dim)] text-sm font-mono">
              Select a cover letter style for your target job domain
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <button
              onClick={handleDownloadLetter}
              disabled={isDownloadingLetter}
              className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 bg-primary text-[var(--terminal-on-primary)] text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/80 transition-all active:scale-[0.97] shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.3)] border border-transparent hover:border-[var(--terminal-hover-border)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <span className={`material-symbols-outlined text-base sm:text-lg mr-2 ${isDownloadingLetter ? 'animate-spin' : ''}`}>
                {isDownloadingLetter ? 'progress_activity' : 'download'}
              </span>
              <span className="truncate font-mono text-xs sm:text-sm md:text-base">
                {isDownloadingLetter ? 'GENERATING...' : 'DOWNLOAD_PDF'}
              </span>
            </button>
          </div>
        </div>

        <StyleSelectorGrid styles={coverLetterConfig.styles} selectedId={selectedLetterStyle} onSelect={setSelectedLetterStyle} />

        <ViewToggleButton visible={showLetter} onToggle={() => setShowLetter(!showLetter)} label="LETTER" />
      </div>

      {/* Cover Letter Preview */}
      <RevealContainer visible={showLetter}>
        <ScaleToFit>
          <CoverLetterPreview
            siteConfig={siteConfig}
            style={selectedCoverLetterStyle}
            email={coverLetterConfig.email}
          />
        </ScaleToFit>
      </RevealContainer>
    </>
  );
}
