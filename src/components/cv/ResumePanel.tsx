'use client';

import { useState } from 'react';
import CVTemplate from '@/components/CVTemplate';
import CVDesignedTemplate from '@/components/CVDesignedTemplate';
import VariantToggle, { type CVVariant } from '@/components/cv/VariantToggle';
import ScaleToFit from '@/components/ScaleToFit';
import PagedPreview from '@/components/cv/PagedPreview';
import { useUltrawide } from '@/hooks/useUltrawide';
import StyleSelectorGrid from '@/components/cv/StyleSelectorGrid';
import ViewToggleButton from '@/components/cv/ViewToggleButton';
import RevealContainer from '@/components/cv/RevealContainer';
import DownloadButton from '@/components/cv/DownloadButton';
import { usePdfDownload } from '@/hooks/usePdfDownload';
import { cvConfig, features, getCoverLetterForCV, siteConfig, experience, education, languages, certifications, hobbies, projects } from '@/config';
import type { ContributionStats } from '@/lib/github-contributions';
import Reveal from '@/components/Reveal';
import { eventProps } from '@/lib/track';
import TypedText from '@/components/TypedText';
import SignatureUnlock from '@/components/cv/SignatureUnlock';
import type { SignatureState } from '@/hooks/useSignature';
import { loadCVPhoto } from '@/lib/cv-photo';

interface ResumePanelProps {
  contributionStats: Record<string, ContributionStats | null>;
  email?: string;
  phone?: string;
  signature: SignatureState;
}

type CVStyle = (typeof cvConfig.styles)[number];

const fileName = (kind: string) => `${siteConfig.fullName.replace(/\s+/g, '_')}_${kind}.pdf`;

function useCVDownloads({ style, styleId, variant, useColumnLayout, contributionStats, email, phone, signature }: {
  style: CVStyle;
  styleId: string;
  variant: CVVariant;
  useColumnLayout: boolean;
  contributionStats: Record<string, ContributionStats | null>;
  email?: string;
  phone?: string;
  signature?: string;
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

  const designedPhoto = () => variant === 'designed' ? loadCVPhoto(cvConfig.photo) : undefined;

  const downloadCV = () => cv.download(async () => {
    const [{ pdf }, { default: CVDocument }, photo] = await Promise.all([
      import('@react-pdf/renderer'),
      variant === 'designed' ? import('@/components/CVDesignedDocument') : import('@/components/CVDocument'),
      designedPhoto(),
    ]);
    return { blob: await pdf(<CVDocument {...cvProps} photo={photo} />).toBlob(), filename: fileName('CV') };
  });

  const downloadApplication = () => letterStyle && application.download(async () => {
    const [{ pdf }, { default: ApplicationDocument }, photo] = await Promise.all([
      import('@react-pdf/renderer'),
      import('@/components/ApplicationDocument'),
      designedPhoto(),
    ]);
    return { blob: await pdf(<ApplicationDocument cv={{ ...cvProps, photo }} variant={variant} letterStyle={letterStyle} signature={signature} />).toBlob(), filename: fileName('CV_Cover_Letter') };
  });

  return { cv, downloadCV, application, downloadApplication, letterStyle };
}

function ColumnLayoutToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      {...eventProps('cv_column_toggle', { to: active ? '1-col' : '2-col' })}
      className={`flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 border-2 transition active:scale-[0.97] ${active
        ? 'bg-[var(--terminal-surface-alt)] border-primary text-primary hover:bg-[var(--terminal-surface-hover)]'
        : 'bg-[var(--terminal-surface-alt)] border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary'
        }`}
    >
      <span aria-hidden="true" className="material-symbols-outlined text-base sm:text-lg mr-2">
        {active ? 'view_column' : 'view_list'}
      </span>
      <span className="truncate font-mono text-xs sm:text-sm">
        {active ? '2 COL' : '1 COL'}
      </span>
    </button>
  );
}

export default function ResumePanel({ contributionStats, email, phone, signature }: ResumePanelProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>(cvConfig.styles[0].id);
  const [variant, setVariant] = useState<CVVariant>('ats');
  const [useColumnLayout, setUseColumnLayout] = useState<boolean>(false);
  const [showCV, setShowCV] = useState<boolean>(true);
  const ultrawide = useUltrawide();

  const selectedCVStyle = cvConfig.styles.find(s => s.id === selectedStyle) || cvConfig.styles[0];

  const designed = variant === 'designed';
  const showColumnWarning = !designed && useColumnLayout;
  const templateProps = {
    style: selectedCVStyle,
    siteConfig,
    experience,
    education,
    languages,
    certifications,
    hobbies,
    projects,
    summary: cvConfig.summary,
    useColumnLayout,
    contributionStats,
  };
  const preview = designed ? <CVDesignedTemplate {...templateProps} /> : <CVTemplate {...templateProps} />;

  const { cv, downloadCV, application, downloadApplication, letterStyle } = useCVDownloads({
    style: selectedCVStyle,
    styleId: selectedStyle,
    variant,
    useColumnLayout,
    contributionStats,
    email,
    phone,
    signature: signature.image,
  });

  return (
    <>
      <Reveal draw className="uw-cv-controls mb-6 p-4 sm:p-6 rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface)] no-print">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-[var(--terminal-text)] text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.015em] font-mono mb-2">
              <span className="text-primary">&gt;</span> <TypedText text="CV_DOWNLOAD.sh" />
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <VariantToggle variant={variant} onChange={setVariant} />
            {!designed && <ColumnLayoutToggle active={useColumnLayout} onToggle={() => setUseColumnLayout(!useColumnLayout)} />}
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
            opacity: showColumnWarning ? 1 : 0,
            maxHeight: showColumnWarning ? '80px' : '0px',
            marginBottom: showColumnWarning ? '1rem' : '0px',
            transition: 'opacity 300ms ease-out, max-height 300ms ease-out, margin-bottom 300ms ease-out',
          }}
          aria-hidden={!showColumnWarning}
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded border border-yellow-500/30 bg-yellow-500/10">
            <span aria-hidden="true" className="material-symbols-outlined text-yellow-400 text-base flex-shrink-0">warning</span>
            <p className="text-[var(--terminal-text-muted)] text-xs sm:text-xs font-mono leading-relaxed">
              1 Column style recommended.
            </p>
          </div>
        </div>

        <StyleSelectorGrid styles={cvConfig.styles} selectedId={selectedStyle} onSelect={setSelectedStyle} />

        {features.signature && letterStyle && <SignatureUnlock signature={signature} />}

        {!ultrawide && <ViewToggleButton visible={showCV} onToggle={() => setShowCV(!showCV)} label="CV" />}
      </Reveal>

      {ultrawide ? (
        <div className="uw-cv-preview">
          <PagedPreview label="CV" bleed={designed}>
            {preview}
          </PagedPreview>
        </div>
      ) : (
      <Reveal>
      <RevealContainer visible={showCV}>
        <ScaleToFit>
          {preview}
        </ScaleToFit>
      </RevealContainer>
      </Reveal>
      )}
    </>
  );
}
