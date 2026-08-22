'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CVTemplate from '@/components/CVTemplate';
import CoverLetterPreview from '@/components/CoverLetterPreview';
import ScaleToFit from '@/components/ScaleToFit';
import TurnstileGate from '@/components/TurnstileGate';
import { cvConfig, coverLetterConfig, siteConfig, experience, education, languages, certifications, hobbies, projects } from '../../config';
import type { ContributionStats } from '@/lib/github-contributions';

interface CVClientProps {
  contributionStats?: Record<string, ContributionStats | null>;
}

export default function CVClient({ contributionStats = {} }: CVClientProps) {
  const [activeTab, setActiveTab] = useState<'resume' | 'letter'>('resume');
  const [selectedStyle, setSelectedStyle] = useState<string>(cvConfig.styles[0].id);
  const [isDownloading, setIsDownloading] = useState(false);
  const [useColumnLayout, setUseColumnLayout] = useState<boolean>(false);
  const [showCV, setShowCV] = useState<boolean>(false);

  const [selectedLetterStyle, setSelectedLetterStyle] = useState<string>(coverLetterConfig.styles[0].id);
  const [isDownloadingLetter, setIsDownloadingLetter] = useState(false);
  const [showLetter, setShowLetter] = useState<boolean>(false);

  const selectedCVStyle = cvConfig.styles.find(s => s.id === selectedStyle) || cvConfig.styles[0];
  const selectedCoverLetterStyle = coverLetterConfig.styles.find(s => s.id === selectedLetterStyle) || coverLetterConfig.styles[0];

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

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${siteConfig.fullName.replace(/\s+/g, '_')}_CV_${selectedStyle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

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

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${siteConfig.fullName.replace(/\s+/g, '_')}_Cover_Letter_${selectedLetterStyle}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloadingLetter(false);
    }
  };

  return (
    <>
      <TurnstileGate decryptingLabel="VERIFYING..." />
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-hidden font-display print:bg-white print:min-h-0">
      {/* Background Grid Pattern Effect */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none print:hidden" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

      <div className="layout-container flex h-full grow flex-col">
        <div className="no-print">
          <Header />
        </div>

        <div className="turnstile-gated-content px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 print:px-0 print:py-0">
          <div className="layout-content-container flex flex-col max-w-[1200px] w-full flex-1 print:max-w-full">
            <main id="main-content" tabIndex={-1}>
            {/* Tab Switcher */}
            <div className="mb-6 flex gap-2 no-print">
              <button
                onClick={() => setActiveTab('resume')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded h-11 px-5 border font-mono text-sm font-bold transition-all cursor-pointer ${activeTab === 'resume'
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.3)]'
                  : 'border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] text-[var(--terminal-text-muted)] hover:border-primary/50'
                  }`}
              >
                <span className="material-symbols-outlined text-lg">description</span>
                RESUME
              </button>
              <button
                onClick={() => setActiveTab('letter')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded h-11 px-5 border font-mono text-sm font-bold transition-all cursor-pointer ${activeTab === 'letter'
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.3)]'
                  : 'border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] text-[var(--terminal-text-muted)] hover:border-primary/50'
                  }`}
              >
                <span className="material-symbols-outlined text-lg">mail</span>
                COVER LETTER
              </button>
            </div>

            {activeTab === 'resume' && (
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {cvConfig.styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex flex-col gap-2 p-4 rounded border transition-all active:scale-[0.98] cursor-pointer text-left ${selectedStyle === style.id
                      ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.3)]'
                      : 'border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] hover:border-primary/50 hover:bg-[var(--terminal-surface-hover)]'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded flex items-center justify-center ${selectedStyle === style.id ? 'bg-primary/20 text-primary' : 'bg-[var(--terminal-bg)] text-[var(--terminal-text-dim)]'
                        }`}>
                        <span className="material-symbols-outlined text-[24px] leading-none">{style.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className={`text-sm sm:text-base font-bold font-mono ${selectedStyle === style.id ? 'text-primary' : 'text-[var(--terminal-text)]'
                          }`}>
                          {style.name}
                        </h2>
                        <p className="text-[var(--terminal-text-dim)] text-xs font-mono mt-1">
                          {style.domain}
                        </p>
                      </div>
                    </div>
                    <p className="text-[var(--terminal-text-muted)] text-xs font-mono leading-relaxed">
                      {style.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* View CV Button */}
              <div className="mt-6 pt-4 border-t border-[var(--terminal-border)]">
                <button
                  onClick={() => setShowCV(!showCV)}
                  aria-expanded={showCV}
                  className="w-full flex items-center justify-center gap-3 rounded h-12 px-6 bg-primary text-[var(--terminal-on-primary)] text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/80 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.3)] border border-transparent hover:border-[var(--terminal-hover-border)]"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showCV ? 'visibility_off' : 'visibility'}
                  </span>
                  <span className="font-mono text-sm md:text-base">
                    {showCV ? 'HIDE CV' : 'VIEW CV'}
                  </span>
                </button>
              </div>
            </div>

            {/* CV Template */}
            <div
              className="cv-container overflow-hidden print:p-0 print:overflow-visible print:opacity-100! print:max-h-none!"
              style={{
                opacity: showCV ? 1 : 0,
                maxHeight: showCV ? '20000px' : '0px',
                pointerEvents: showCV ? 'auto' : 'none',
                transition: 'opacity 300ms ease-out, max-height 300ms ease-out',
              }}
              aria-hidden={!showCV}
            >
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
            </div>
            </>
            )}

            {activeTab === 'letter' && (
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {coverLetterConfig.styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedLetterStyle(style.id)}
                    className={`flex flex-col gap-2 p-4 rounded border transition-all active:scale-[0.98] cursor-pointer text-left ${selectedLetterStyle === style.id
                      ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.3)]'
                      : 'border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] hover:border-primary/50 hover:bg-[var(--terminal-surface-hover)]'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded flex items-center justify-center ${selectedLetterStyle === style.id ? 'bg-primary/20 text-primary' : 'bg-[var(--terminal-bg)] text-[var(--terminal-text-dim)]'
                        }`}>
                        <span className="material-symbols-outlined text-[24px] leading-none">{style.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className={`text-sm sm:text-base font-bold font-mono ${selectedLetterStyle === style.id ? 'text-primary' : 'text-[var(--terminal-text)]'
                          }`}>
                          {style.name}
                        </h2>
                        <p className="text-[var(--terminal-text-dim)] text-xs font-mono mt-1">
                          {style.domain}
                        </p>
                      </div>
                    </div>
                    <p className="text-[var(--terminal-text-muted)] text-xs font-mono leading-relaxed">
                      {style.description}
                    </p>
                  </button>
                ))}
              </div>

              {/* View Letter Button */}
              <div className="mt-6 pt-4 border-t border-[var(--terminal-border)]">
                <button
                  onClick={() => setShowLetter(!showLetter)}
                  aria-expanded={showLetter}
                  className="w-full flex items-center justify-center gap-3 rounded h-12 px-6 bg-primary text-[var(--terminal-on-primary)] text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/80 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.3)] border border-transparent hover:border-[var(--terminal-hover-border)]"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showLetter ? 'visibility_off' : 'visibility'}
                  </span>
                  <span className="font-mono text-sm md:text-base">
                    {showLetter ? 'HIDE LETTER' : 'VIEW LETTER'}
                  </span>
                </button>
              </div>
            </div>

            {/* Cover Letter Preview */}
            <div
              className="cv-container overflow-hidden print:p-0 print:overflow-visible print:opacity-100! print:max-h-none!"
              style={{
                opacity: showLetter ? 1 : 0,
                maxHeight: showLetter ? '20000px' : '0px',
                pointerEvents: showLetter ? 'auto' : 'none',
                transition: 'opacity 300ms ease-out, max-height 300ms ease-out',
              }}
              aria-hidden={!showLetter}
            >
              <ScaleToFit>
                <CoverLetterPreview
                  siteConfig={siteConfig}
                  style={selectedCoverLetterStyle}
                  email={coverLetterConfig.email}
                />
              </ScaleToFit>
            </div>
            </>
            )}
            </main>

            <div className="no-print">
              <Footer />
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
