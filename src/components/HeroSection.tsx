'use client';
import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { siteConfig, contentConfig, badges } from '@/config';

export default function HeroSection() {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleSpotlight = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty('--spot-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  return (
    <div className="@container mb-8">
      <div className="@[480px]:p-4">
        <div
          ref={cardRef}
          onMouseMove={handleSpotlight}
          className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded items-start justify-end px-4 pb-10 @[480px]:px-10 border border-[var(--terminal-border)] relative overflow-hidden group"
          style={{ backgroundImage: `linear-gradient(rgba(var(--terminal-bg-rgb), 0.8) 0%, rgba(var(--terminal-bg-rgb), 0.95) 100%)` }}
        >
          <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-15 pointer-events-none z-0 mix-blend-overlay"></div>
          <div className="absolute inset-0 matrix-bg opacity-30 pointer-events-none z-0"></div>
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
            style={{ background: 'radial-gradient(500px circle at var(--spot-x, 50%) var(--spot-y, 50%), rgba(var(--terminal-accent-rgb), 0.15), transparent 70%)' }}
          ></div>
          <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[rgba(var(--terminal-accent-rgb),0.3)] to-transparent opacity-60 pointer-events-none animate-scan z-10 mix-blend-screen"></div>

          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <div className="w-3 h-3 rounded-full bg-red-500/80 border border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.6)] hover:brightness-125 transition-all"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-400 shadow-[0_0_8px_rgba(234,179,8,0.6)] hover:brightness-125 transition-all"></div>
            <div className="w-3 h-3 rounded-full bg-green-500/80 border border-green-400 shadow-[0_0_8px_rgba(34,197,94,0.6)] hover:brightness-125 transition-all"></div>
          </div>
          <div className="flex flex-col gap-2 text-left z-10">
            <h1 className="animate-reveal text-[var(--terminal-text)] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-[-0.033em] font-mono glow-text">
              {contentConfig.home.hero.title}<span className="blinking-cursor text-primary">_</span>
            </h1>
            <h2 className="animate-reveal text-[var(--terminal-text-dim)] text-xs sm:text-sm md:text-base lg:text-lg font-mono leading-normal max-w-full md:max-w-[600px] mt-2 whitespace-pre-line" style={{ animationDelay: '140ms' }}>
              <span className="text-primary font-bold">{siteConfig.domain}</span> {contentConfig.home.hero.subtitle}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3 sm:gap-4 z-10">
            <Link href={contentConfig.home.hero.ctaPrimary.link} className="flex min-w-[120px] sm:min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 bg-primary text-black sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-white hover:-translate-y-[2px] hover:shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.6)] active:scale-[0.97] active:translate-y-0 transition-all shadow-[0_0_10px_rgba(var(--terminal-accent-rgb),0.3)] border border-transparent">
              <span className="truncate font-mono text-xs sm:text-sm md:text-base drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]">{contentConfig.home.hero.ctaPrimary.text}</span>
            </Link>
            <Link href={contentConfig.home.hero.ctaSecondary.link || '#'} className="flex min-w-[100px] sm:min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 bg-[var(--terminal-surface-alt)] border-2 border-[var(--terminal-accent-alt)] text-[var(--terminal-text-muted)] text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:border-primary hover:text-primary hover:bg-[var(--terminal-surface-hover)] hover:shadow-[0_0_20px_rgba(var(--terminal-accent-alt-rgb),0.5)] hover:-translate-y-[2px] active:scale-[0.97] active:translate-y-0 transition-all group/cta">
              <span className="truncate font-mono text-xs sm:text-sm md:text-base group-hover/cta:translate-x-0.5 transition-transform">{contentConfig.home.hero.ctaSecondary.text}</span>
            </Link>
          </div>
          {badges.length > 0 && (
            <div className="mt-6 z-10 flex flex-wrap gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="group/badge opacity-80 hover:opacity-100 transition-opacity">
                  <a
                    href={badge.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <div className={`relative p-[2px] rounded ${badge.containerClasses || ''}`}>
                      <Image
                        src={badge.imageUrl}
                        alt={badge.name}
                        width={220}
                        height={60}
                        className="h-auto w-[180px] sm:w-[220px] rounded-[3px] block"
                        style={badge.imageStyle}
                        unoptimized
                      />
                    </div>
                    <p className="mt-1 text-[10px] font-mono text-[var(--terminal-text-dim)] group-hover/badge:text-primary transition-colors">
                      {badge.statusText}
                    </p>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
