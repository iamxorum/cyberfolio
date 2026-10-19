'use client';

import { useState } from 'react';
import { features } from '@/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TabSwitcher, { type CVTab } from '@/components/cv/TabSwitcher';
import ResumePanel from '@/components/cv/ResumePanel';
import CoverLetterPanel from '@/components/cv/CoverLetterPanel';
import { NO_CONTRIBUTION_STATS, type ContributionStats } from '@/lib/github-contributions';

interface CVClientProps {
  contributionStats?: Record<string, ContributionStats | null>;
  email?: string;
  phone?: string;
}

export default function CVClient({ contributionStats = NO_CONTRIBUTION_STATS, email, phone }: CVClientProps) {
  const [activeTab, setActiveTab] = useState<CVTab>('resume');

  return (
    <>
      <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] group/design-root overflow-x-clip font-display print:bg-white print:min-h-0">
        <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none print:hidden" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>

        <div className="layout-container flex h-full grow flex-col">
          <div className="no-print">
            <Header />
          </div>

          <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 print:px-0 print:py-0">
            <div className="layout-content-container flex flex-col max-w-[1200px] w-full flex-1 print:max-w-full">
              <main id="main-content" tabIndex={-1}>
                {features.coverLetter && <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />}

                <div key={activeTab} className="animate-fade-in-fast print:animate-none">
                  {activeTab === 'resume' && <ResumePanel contributionStats={contributionStats} email={email} phone={phone} />}
                  {features.coverLetter && activeTab === 'letter' && <CoverLetterPanel email={email} phone={phone} />}
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
