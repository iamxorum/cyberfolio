'use client';
import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';
import { contentConfig } from '@/config';

export default function SystemStats({ uptime, userId, viewport, responseTime }: { uptime: string; userId: string; viewport: string; responseTime: string }) {
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (statsRef.current) {
      const elements = statsRef.current.querySelectorAll('div[class*="flex min-w"]');
      animate(Array.from(elements), {
        opacity: [0, 1],
        scale: [0.95, 1],
        delay: stagger(200),
        duration: 800,
        easing: 'easeOutQuad',
      });
    }
  }, []);

  return (
    <div className="flex flex-wrap gap-3 sm:gap-4 p-2 sm:p-4 mb-6 sm:mb-8" ref={statsRef}>
      <div className="flex min-w-[140px] sm:min-w-[158px] flex-1 flex-col gap-2 rounded p-4 sm:p-6 border border-[var(--terminal-border)] bg-[var(--terminal-surface)] relative overflow-hidden group hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.2)] hover:-translate-y-[2px] hover:bg-[var(--terminal-surface-hover)] transition-all duration-300">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(var(--terminal-accent-rgb),1)]"></div>
        <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 blur-md pointer-events-none transition-opacity"></div>
        <div className="flex justify-between items-start z-10">
          <p className="text-[var(--terminal-text-dim)] text-xs font-mono font-medium leading-normal tracking-widest">{contentConfig.home.stats.uptime.label}</p>
          <span className="material-symbols-outlined text-primary text-[20px] drop-shadow-[0_0_5px_rgba(var(--terminal-accent-rgb),0.5)] group-hover:scale-110 transition-transform">{contentConfig.home.stats.uptime.icon}</span>
        </div>
        <p className="text-white tracking-light text-2xl font-bold leading-tight font-mono z-10">{uptime}</p>
        <p className="text-[var(--terminal-success)] text-xs font-medium leading-normal font-mono flex items-center gap-1 z-10">
        </p>
      </div>
      
      <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded p-6 border border-[var(--terminal-border)] bg-[var(--terminal-surface)] relative overflow-hidden group hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.2)] hover:-translate-y-[2px] hover:bg-[var(--terminal-surface-hover)] transition-all duration-300">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(var(--terminal-accent-rgb),1)]"></div>
        <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 blur-md pointer-events-none transition-opacity"></div>
        <div className="flex justify-between items-start z-10">
          <p className="text-[var(--terminal-text-dim)] text-xs font-mono font-medium leading-normal tracking-widest">{contentConfig.home.stats.sessionId.label}</p>
          <span className="material-symbols-outlined text-primary text-[20px] drop-shadow-[0_0_5px_rgba(var(--terminal-accent-rgb),0.5)] group-hover:scale-110 transition-transform">{contentConfig.home.stats.sessionId.icon}</span>
        </div>
        <p className="text-white tracking-light text-2xl font-bold leading-tight font-mono z-10">{userId ? `XRM-${userId}` : 'XRM--------'}</p>
        <p className="text-primary text-xs font-medium leading-normal font-mono z-10">USER: {userId || 'GUEST'}</p>
      </div>
      
      <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded p-6 border border-[var(--terminal-border)] bg-[var(--terminal-surface)] relative overflow-hidden group hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.2)] hover:-translate-y-[2px] hover:bg-[var(--terminal-surface-hover)] transition-all duration-300">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(var(--terminal-accent-rgb),1)]"></div>
        <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 blur-md pointer-events-none transition-opacity"></div>
        <div className="flex justify-between items-start z-10">
          <p className="text-[var(--terminal-text-dim)] text-xs font-mono font-medium leading-normal tracking-widest">{contentConfig.home.stats.viewport.label}</p>
          <span className="material-symbols-outlined text-primary text-[20px] drop-shadow-[0_0_5px_rgba(var(--terminal-accent-rgb),0.5)] group-hover:scale-110 transition-transform">{contentConfig.home.stats.viewport.icon}</span>
        </div>
        <p className="text-white tracking-light text-2xl font-bold leading-tight font-mono z-10">{viewport}</p>
        <p className="text-[var(--terminal-success)] text-xs font-medium leading-normal font-mono drop-shadow-[0_0_3px_rgba(var(--terminal-success-rgb),0.5)] z-10">LIVE</p>
      </div>
      
      <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded p-6 border border-[var(--terminal-border)] bg-[var(--terminal-surface)] relative overflow-hidden group hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.2)] hover:-translate-y-[2px] hover:bg-[var(--terminal-surface-hover)] transition-all duration-300">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(var(--terminal-accent-rgb),1)]"></div>
        <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 blur-md pointer-events-none transition-opacity"></div>
        <div className="flex justify-between items-start z-10">
          <p className="text-[var(--terminal-text-dim)] text-xs font-mono font-medium leading-normal tracking-widest">{contentConfig.home.stats.responseTime.label}</p>
          <span className="material-symbols-outlined text-primary text-[20px] drop-shadow-[0_0_5px_rgba(var(--terminal-accent-rgb),0.5)] group-hover:scale-110 transition-transform">{contentConfig.home.stats.responseTime.icon}</span>
        </div>
        <p className="text-white tracking-light text-2xl font-bold leading-tight font-mono z-10">{responseTime}</p>
        <p className="text-[var(--terminal-success)] text-xs font-medium leading-normal font-mono drop-shadow-[0_0_3px_rgba(var(--terminal-success-rgb),0.5)] z-10">LIVE</p>
      </div>
    </div>
  );
}
