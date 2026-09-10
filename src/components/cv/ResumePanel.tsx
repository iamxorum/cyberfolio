'use client';

import { useState } from 'react';
import CVTemplate from '@/components/CVTemplate';
import ScaleToFit from '@/components/ScaleToFit';
import StyleSelectorGrid from '@/components/cv/StyleSelectorGrid';
import ViewToggleButton from '@/components/cv/ViewToggleButton';
import RevealContainer from '@/components/cv/RevealContainer';
import { downloadBlob } from '@/lib/download-blob';
import { cvConfig, siteConfig, experience, education, languages, certifications, hobbies, projects } from '@/config';
import type { ContributionStats } from '@/lib/github-contributions';

interface ResumePanelProps {
  contributionStats: Record<string, ContributionStats | null>;
}

export default function ResumePanel({ contributionStats }: ResumePanelProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>(cvConfig.styles[0].id);
  const [isDownloading, setIsDownloading] = useState(false);
  const [useColumnLayout, setUseColumnLayout] = useState<boolean>(false);
  const [showCV, setShowCV] = useState<boolean>(false);

  const selectedCVStyle = cvConfig.styles.find(s => s.id === selectedStyle) || cvConfig.styles[0];

  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    try {
      const [{ pdf }, { default: CVDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('@/components/CVDocument'),
      ]);

      const blob = await pdf(
        <CVDocument
          style={selectedCVStyle}
          siteConfig={siteConfig}
          experience={experience}
          education={education}
          languages={languages}
          certifications={certifications}
          hobbies={hobbies}
          projects={projects}
          summary={cvConfig.summary}
          email={cvConfig.email}
          useColumnLayout={useColumnLayout}
          contributionStats={contributionStats}
        />
      ).toBlob();

      downloadBlob(blob, `${siteConfig.fullName.replace(/\s+/g, '_')}_CV_${selectedStyle}.pdf`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      {/* CV Style Selector */}
      <div className="mb-6 p-4 sm:p-6 rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface)] no-print">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[var(--terminal-text)] text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.015em] font-mono mb-2">
              <span className="text-primary">&gt;</span> CV_DOWNLOAD.sh
            </h1>
            <p className="text-[var(--terminal-text-dim)] text-sm font-mono">
              Select a CV style for your target job domain
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            {/* Column Layout Toggle */}
            <button
              onClick={() => setUseColumnLayout(!useColumnLayout)}
              className={`flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 border-2 transition-all active:scale-[0.97] ${useColumnLayout
                ? 'bg-[var(--terminal-surface-alt)] border-primary text-primary hover:bg-[var(--terminal-surface-hover)]'
                : 'bg-[var(--terminal-surface-alt)] border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary'
                }`}
            >
              <span className="material-symbols-outlined text-base sm:text-lg mr-2">
                {useColumnLayout ? 'view_column' : 'view_list'}
              </span>
              <span className="truncate font-mono text-xs sm:text-sm">
                {useColumnLayout ? '2 COL' : '1 COL'}
              </span>
            </button>
            {/* Download Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 bg-primary text-[var(--terminal-on-primary)] text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/80 transition-all active:scale-[0.97] shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.3)] border border-transparent hover:border-[var(--terminal-hover-border)] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              <span className={`material-symbols-outlined text-base sm:text-lg mr-2 ${isDownloading ? 'animate-spin' : ''}`}>
                {isDownloading ? 'progress_activity' : 'download'}
              </span>
              <span className="truncate font-mono text-xs sm:text-sm md:text-base">
                {isDownloading ? 'GENERATING...' : 'DOWNLOAD_PDF'}
              </span>
            </button>
          </div>
        </div>

        <div
          className="overflow-hidden"
          style={{
            opacity: useColumnLayout ? 1 : 0,
            maxHeight: useColumnLayout ? '80px' : '0px',
            marginBottom: useColumnLayout ? '1rem' : '0px',
            transition: 'opacity 250ms ease-out, max-height 250ms ease-out, margin-bottom 250ms ease-out',
          }}
          aria-hidden={!useColumnLayout}
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded border border-yellow-500/30 bg-yellow-500/10">
            <span className="material-symbols-outlined text-yellow-400 text-base flex-shrink-0">warning</span>
            <p className="text-[var(--terminal-text-muted)] text-[10px] sm:text-xs font-mono leading-relaxed">
              1 Column style recommended.
            </p>
          </div>
        </div>

        <StyleSelectorGrid styles={cvConfig.styles} selectedId={selectedStyle} onSelect={setSelectedStyle} />

        <ViewToggleButton visible={showCV} onToggle={() => setShowCV(!showCV)} label="CV" />
      </div>

      {/* CV Template */}
      <RevealContainer visible={showCV}>
        <ScaleToFit>
          <CVTemplate
            style={selectedCVStyle}
            siteConfig={siteConfig}
            experience={experience}
            education={education}
            languages={languages}
            certifications={certifications}
            hobbies={hobbies}
            projects={projects}
            summary={cvConfig.summary}
            email={cvConfig.email}
            useColumnLayout={useColumnLayout}
            contributionStats={contributionStats}
          />
        </ScaleToFit>
      </RevealContainer>
    </>
  );
}
