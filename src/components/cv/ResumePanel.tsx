'use client';

import { useState } from 'react';
import CVTemplate from '@/components/CVTemplate';
import ScaleToFit from '@/components/ScaleToFit';
import StyleSelectorGrid from '@/components/cv/StyleSelectorGrid';
import ViewToggleButton from '@/components/cv/ViewToggleButton';
import RevealContainer from '@/components/cv/RevealContainer';
import DownloadButton from '@/components/cv/DownloadButton';
import { usePdfDownload } from '@/hooks/usePdfDownload';
import { cvConfig, features, getCoverLetterForCV, siteConfig, experience, education, languages, certifications, hobbies, projects } from '@/config';
import type { ContributionStats } from '@/lib/github-contributions';
import Reveal from '@/components/Reveal';
import TypedText from '@/components/TypedText';

interface ResumePanelProps {
  contributionStats: Record<string, ContributionStats | null>;
  email?: string;
  phone?: string;
}

type CVStyle = (typeof cvConfig.styles)[number];

const fileName = (kind: string, styleId: string) => `${siteConfig.fullName.replace(/\s+/g, '_')}_${kind}_${styleId}.pdf`;

function useCVDownloads({ style, styleId, useColumnLayout, contributionStats, email, phone }: {
  style: CVStyle;
  styleId: string;
  useColumnLayout: boolean;
  contributionStats: Record<string, ContributionStats | null>;
  email?: string;
  phone?: string;
}) {
  const cv = usePdfDownload();
  const application = usePdfDownload();

  const cvProps = {
    style,
    siteConfig,
    experience,
    education,
    languages,
    certifications,
    hobbies,
    projects,
    summary: cvConfig.summary,
    email,
    phone,
    useColumnLayout,
    contributionStats,
  };

  const letterStyle = features.coverLetter ? getCoverLetterForCV(styleId) : undefined;

  const downloadCV = () => cv.download(async () => {
    const [{ pdf }, { default: CVDocument }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('@/components/CVDocument'),
    ]);
    return { blob: await pdf(<CVDocument {...cvProps} />).toBlob(), filename: fileName('CV', styleId) };
  });

  const downloadApplication = () => letterStyle && application.download(async () => {
    const [{ pdf }, { default: ApplicationDocument }] = await Promise.all([
      import('@react-pdf/renderer'),
      import('@/components/ApplicationDocument'),
    ]);
    return { blob: await pdf(<ApplicationDocument cv={cvProps} letterStyle={letterStyle} />).toBlob(), filename: fileName('Application', styleId) };
  });

  return { cv, downloadCV, application, downloadApplication, letterStyle };
}

function ColumnLayoutToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 border-2 transition active:scale-[0.97] ${active
        ? 'bg-[var(--terminal-surface-alt)] border-primary text-primary hover:bg-[var(--terminal-surface-hover)]'
        : 'bg-[var(--terminal-surface-alt)] border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary'
        }`}
    >
      <span className="material-symbols-outlined text-base sm:text-lg mr-2">
        {active ? 'view_column' : 'view_list'}
      </span>
      <span className="truncate font-mono text-xs sm:text-sm">
        {active ? '2 COL' : '1 COL'}
      </span>
    </button>
  );
}

export default function ResumePanel({ contributionStats, email, phone }: ResumePanelProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>(cvConfig.styles[0].id);
  const [useColumnLayout, setUseColumnLayout] = useState<boolean>(false);
  const [showCV, setShowCV] = useState<boolean>(true);

  const selectedCVStyle = cvConfig.styles.find(s => s.id === selectedStyle) || cvConfig.styles[0];

  const { cv, downloadCV, application, downloadApplication, letterStyle } = useCVDownloads({
    style: selectedCVStyle,
    styleId: selectedStyle,
    useColumnLayout,
    contributionStats,
    email,
    phone,
  });

  return (
    <>
      <Reveal draw className="mb-6 p-4 sm:p-6 rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface)] no-print">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[var(--terminal-text)] text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.015em] font-mono mb-2">
              <span className="text-primary">&gt;</span> <TypedText text="CV_DOWNLOAD.sh" />
            </h1>
            <p className="text-[var(--terminal-text-dim)] text-sm font-mono">
              Select a CV style for your target job domain
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <ColumnLayoutToggle active={useColumnLayout} onToggle={() => setUseColumnLayout(!useColumnLayout)} />
            {letterStyle && (
              <DownloadButton
                isDownloading={application.isDownloading}
                succeeded={application.succeeded}
                onClick={downloadApplication}
                label="CV + LETTER"
                variant="secondary"
              />
            )}
            <DownloadButton isDownloading={cv.isDownloading} succeeded={cv.succeeded} onClick={downloadCV} />
          </div>
        </div>

        <div
          className="overflow-hidden"
          style={{
            opacity: useColumnLayout ? 1 : 0,
            maxHeight: useColumnLayout ? '80px' : '0px',
            marginBottom: useColumnLayout ? '1rem' : '0px',
            transition: 'opacity 300ms ease-out, max-height 300ms ease-out, margin-bottom 300ms ease-out',
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
      </Reveal>

      <Reveal>
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
            email={email}
            useColumnLayout={useColumnLayout}
            contributionStats={contributionStats}
          />
        </ScaleToFit>
      </RevealContainer>
      </Reveal>
    </>
  );
}
