'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CVTemplate from '../components/CVTemplate';
import { cvConfig, siteConfig, experience, education, skills, languages, certifications, hobbies } from '@/config';
import Link from 'next/link';

export default function CVPage() {
  const [selectedStyle, setSelectedStyle] = useState<string>(cvConfig.styles[0].id);
  const [isDownloading, setIsDownloading] = useState(false);
  const [useColumnLayout, setUseColumnLayout] = useState<boolean>(true);
  const [showCV, setShowCV] = useState<boolean>(false);
  const cvContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const handleDownloadPDF = async () => {
    if (!cvContainerRef.current) return;

    setIsDownloading(true);
    
    const wasHidden = !showCV;
    if (wasHidden) {
      setShowCV(true);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    try {
      
      await new Promise((resolve) => {
        const checkLibrary = () => {
          if ((window as any).html2pdf) {
            resolve(true);
          } else {
            setTimeout(checkLibrary, 100);
          }
        };
        checkLibrary();
      });

      const element = cvContainerRef.current;
      
      
      const images = element.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map((img: HTMLImageElement) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve, reject) => {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true); 
            
            setTimeout(() => resolve(true), 5000);
          });
        })
      );

      
      const convertImagesToBase64 = async (container: HTMLElement) => {
        const imgs = container.querySelectorAll('img');
        for (const img of Array.from(imgs)) {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) continue;
            
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            ctx.drawImage(img, 0, 0);
            
            const dataURL = canvas.toDataURL('image/jpeg', 0.95);
            (img as HTMLImageElement).src = dataURL;
          } catch (e) {
            console.warn('Could not convert image to base64:', e);
          }
        }
      };

      
      const profilePic = element.querySelector('[data-pdf-only="true"]') as HTMLElement;
      const profileImg = profilePic?.querySelector('img') as HTMLImageElement;
      
      let originalStyles: { [key: string]: string } = {};
      
      if (profilePic && profileImg) {
        
        if (!profileImg.complete) {
          await new Promise((resolve) => {
            profileImg.onload = () => resolve(true);
            profileImg.onerror = () => resolve(true);
            setTimeout(() => resolve(true), 3000);
          });
        }
        
        
        originalStyles = {
          display: profilePic.style.display || '',
          visibility: profilePic.style.visibility || '',
          opacity: profilePic.style.opacity || ''
        };
        
        
        profilePic.style.setProperty('display', 'block', 'important');
        profilePic.style.setProperty('visibility', 'visible', 'important');
        profilePic.style.setProperty('opacity', '1', 'important');
        
        
        profileImg.style.setProperty('display', 'block', 'important');
        profileImg.style.setProperty('visibility', 'visible', 'important');
        profileImg.style.setProperty('opacity', '1', 'important');
      }

      
      await convertImagesToBase64(element);
      
      
      await new Promise(resolve => setTimeout(resolve, 500));

      const opt = {
        margin: 0.5,
        filename: `CV_${selectedStyle}_${siteConfig.fullName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          allowTaint: true,
          logging: false,
          letterRendering: true
        },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await (window as any).html2pdf().set(opt).from(element).save();
      
      
      if (profilePic) {
        profilePic.style.setProperty('display', 'none', 'important');
        profilePic.style.setProperty('visibility', 'hidden', 'important');
        profilePic.style.setProperty('opacity', '0', 'important');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      window.print();
    } finally {
      setIsDownloading(false);
      if (wasHidden) {
        setShowCV(false);
      }
    }
  };

  const selectedCVStyle = cvConfig.styles.find(s => s.id === selectedStyle) || cvConfig.styles[0];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-white group/design-root overflow-x-hidden font-display">
      {/* Background Grid Pattern Effect */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none print:hidden" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      
      <div className="layout-container flex h-full grow flex-col">
        <div className="no-print">
          <Header />
        </div>
        
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 print:px-0 print:py-0">
          <div className="layout-content-container flex flex-col max-w-[1200px] w-full flex-1 print:max-w-full">
            {/* CV Style Selector */}
            <div className="mb-6 p-4 sm:p-6 rounded border border-[var(--terminal-border)] bg-[var(--terminal-surface)] no-print">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight tracking-[-0.015em] font-mono mb-2">
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
                    className={`flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 border-2 transition-all ${
                      useColumnLayout
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
                    className="flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 bg-primary text-white text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/80 transition-all shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.3)] border border-transparent hover:border-[var(--terminal-hover-border)] disabled:opacity-50 disabled:cursor-not-allowed"
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {cvConfig.styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`flex flex-col gap-2 p-4 rounded border transition-all cursor-pointer text-left ${
                      selectedStyle === style.id
                        ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.3)]'
                        : 'border-[var(--terminal-border)] bg-[var(--terminal-surface-alt)] hover:border-primary/50 hover:bg-[var(--terminal-surface-hover)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${
                        selectedStyle === style.id ? 'bg-primary/20 text-primary' : 'bg-[var(--terminal-bg)] text-[var(--terminal-text-dim)]'
                      }`}>
                        <span className="material-symbols-outlined text-[24px]">{style.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm sm:text-base font-bold font-mono ${
                          selectedStyle === style.id ? 'text-primary' : 'text-white'
                        }`}>
                          {style.name}
                        </h3>
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
                  className="w-full flex items-center justify-center gap-3 rounded h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/80 transition-all shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.3)] border border-transparent hover:border-[var(--terminal-hover-border)]"
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
              ref={cvContainerRef} 
              className="cv-container print:p-0"
              style={{ display: showCV ? 'block' : 'none' }}
            >
              <CVTemplate
                style={selectedCVStyle}
                siteConfig={siteConfig}
                experience={experience}
                education={education}
                skills={skills}
                languages={languages}
                certifications={certifications}
                hobbies={hobbies}
                summary={cvConfig.summary}
                useColumnLayout={useColumnLayout}
              />
            </div>

            <div className="no-print">
              <Footer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

