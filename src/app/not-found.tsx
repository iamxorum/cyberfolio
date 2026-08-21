import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { siteConfig } from '@/config';

export default function NotFound() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[var(--terminal-bg)] text-[var(--terminal-text)] overflow-x-hidden font-display">
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `linear-gradient(var(--terminal-accent-alt) 1px, transparent 1px), linear-gradient(90deg, var(--terminal-accent-alt) 1px, transparent 1px)`, backgroundSize: '40px 40px' }}></div>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5 relative z-10">
          <div className="layout-content-container flex flex-col max-w-[960px] w-full flex-1">
            <main id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center py-16">
              <div className="max-w-lg w-full border border-[var(--terminal-border)] bg-[var(--terminal-surface)] rounded p-8 text-center relative overflow-hidden shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.15)]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[10%] w-full animate-scan pointer-events-none"></div>

                <span className="material-symbols-outlined text-primary text-5xl mb-4">terminal</span>

                <h1 className="text-[var(--terminal-text)] text-2xl font-bold mb-2 tracking-widest uppercase font-mono">404</h1>

                <div className="font-mono text-sm text-left bg-[var(--terminal-bg)] border border-[var(--terminal-border)] rounded p-4 mb-6">
                  <div>
                    <span className="text-primary">root@{siteConfig.username}:~$</span> ls ./this-page
                  </div>
                  <div className="text-red-400 mt-1">
                    ls: cannot access &apos;./this-page&apos;: No such file or directory
                  </div>
                  <div className="mt-3">
                    <span className="text-primary">root@{siteConfig.username}:~$</span> <span className="animate-pulse">_</span>
                  </div>
                </div>

                <p className="text-[var(--terminal-text-dim)] text-xs mb-6 leading-relaxed">
                  That route doesn&apos;t resolve to anything. Might&apos;ve been moved, mistyped, or never existed.
                </p>

                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 rounded h-11 px-6 bg-primary text-black text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/80 active:scale-[0.97] transition-all shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.4)] border border-primary/30"
                >
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  <span className="font-mono">CD ~/</span>
                </Link>
              </div>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
