'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CVTemplate from '@/components/CVTemplate';
import CVDocument from '@/components/CVDocument';
import ScaleToFit from '@/components/ScaleToFit';
import TurnstileGate from '@/components/TurnstileGate';
import { cvConfig, siteConfig, experience, education, languages, certifications, hobbies, projects } from '../../config';

export default function CVClient() {
  const [selectedStyle, setSelectedStyle] = useState<string>(cvConfig.styles[0].id);
  const [isDownloading, setIsDownloading] = useState(false);
  const [useColumnLayout, setUseColumnLayout] = useState<boolean>(false);
  const [showCV, setShowCV] = useState<boolean>(false);

  const selectedCVStyle = cvConfig.styles.find(s => s.id === selectedStyle) || cvConfig.styles[0];

  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    try {
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
                    className={`flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 border-2 transition-all ${useColumnLayout
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
                    className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 bg-primary text-black text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/80 transition-all shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.3)] border border-transparent hover:border-[var(--terminal-hover-border)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-base sm:text-lg mr-2">
                      {isDownloading ? 'hourglass_empty' : 'download'}
                    </span>
                    <span className="truncate font-mono text-xs sm:text-sm md:text-base">
                      {isDownloading ? 'GENERATING...' : 'DOWNLOAD_PDF'}
                    </span>
                  </button>
                </div>
              </div>

              {useColumnLayout && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded border border-yellow-500/30 bg-yellow-500/10">
                  <span className="material-symbols-outlined text-yellow-400 text-base flex-shrink-0">warning</span>
                  <p className="text-[var(--terminal-text-muted)] text-[10px] sm:text-xs font-mono leading-relaxed">
                    1 Column style recommended.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {cvConfig.styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex flex-col gap-2 p-4 rounded border transition-all cursor-pointer text-left ${selectedStyle === style.id
                      ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.3)]'
                      : 'border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] hover:border-primary/50 hover:bg-[var(--terminal-surface-hover)]'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${selectedStyle === style.id ? 'bg-primary/20 text-primary' : 'bg-[var(--terminal-bg)] text-[var(--terminal-text-dim)]'
                        }`}>
                        <span className="material-symbols-outlined text-[24px]">{style.icon}</span>
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
                  className="w-full flex items-center justify-center gap-3 rounded h-12 px-6 bg-primary text-black text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/80 transition-all shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.3)] border border-transparent hover:border-[var(--terminal-hover-border)]"
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
              className="cv-container print:p-0"
              style={{ display: showCV ? 'block' : 'none' }}
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
                />
              </ScaleToFit>
            </div>
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

