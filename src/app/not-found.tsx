import type { Metadata } from 'next';
import { siteConfig } from '@/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NotFoundCard from '@/components/NotFoundCard';

export const metadata: Metadata = { title: `Page not found | ${siteConfig.fullName}` };

export default function NotFound() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] overflow-x-clip font-display">
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 relative z-10">
          <div className="layout-content-container flex flex-col max-w-[960px] w-full flex-1">
            <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center py-16">
              <NotFoundCard />
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
