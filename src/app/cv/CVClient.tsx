'use client';

import { useState } from 'react';
import { features } from '@/config';
import PageShell from '@/components/PageShell';
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
    <PageShell width="xl" viewport printable boot={false} mainClassName="uw-cv-main">
      {features.coverLetter && <TabSwitcher activeTab={activeTab} onChange={setActiveTab} />}

      <div key={activeTab} className="uw-cv animate-fade-in-fast print:animate-none">
        {activeTab === 'resume' && <ResumePanel contributionStats={contributionStats} email={email} phone={phone} />}
        {features.coverLetter && activeTab === 'letter' && <CoverLetterPanel email={email} phone={phone} />}
      </div>
    </PageShell>
  );
}
