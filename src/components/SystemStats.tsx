'use client';
import { contentConfig } from '@/config';
import { STAGGER_STEP_MS, revealDelay } from '@/lib/motion';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import CountUpText from './CountUpText';

export default function SystemStats({ uptime, userId, viewport, responseTime }: { uptime: string; userId: string; viewport: string; responseTime: string }) {
  const revealRef = useScrollReveal<HTMLDivElement>();
  return (
    <div ref={revealRef} className="flex flex-wrap gap-3 sm:gap-4 p-2 sm:p-4 mb-6 sm:mb-8">
      <div data-reveal className="scroll-reveal panel-draw flex min-w-[140px] sm:min-w-[158px] flex-1 flex-col gap-2 rounded p-4 sm:p-6 border border-[var(--terminal-border)] bg-[var(--terminal-surface)] relative overflow-hidden group hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.2)] hover:-translate-y-[2px] hover:bg-[var(--terminal-surface-hover)] transition-[transform,background-color,border-color,box-shadow] duration-300">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(var(--terminal-accent-rgb),1)]"></div>
        <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 blur-md pointer-events-none transition-opacity"></div>
        <div className="flex justify-between items-start z-10">
          <p className="text-[var(--terminal-text-dim)] text-xs font-mono font-medium leading-normal tracking-widest">{contentConfig.home.stats.uptime.label}</p>
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-[20px] drop-shadow-[0_0_5px_rgba(var(--terminal-accent-rgb),0.5)] group-hover:scale-110 transition-transform">{contentConfig.home.stats.uptime.icon}</span>
        </div>
        <p className="text-[var(--terminal-text)] tracking-light text-2xl font-bold leading-tight font-mono z-10"><CountUpText value={uptime} /></p>
        <p className="text-[var(--terminal-success)] text-xs font-medium leading-normal font-mono flex items-center gap-1 z-10">
        </p>
      </div>
      
      <div data-reveal className="scroll-reveal panel-draw flex min-w-[158px] flex-1 flex-col gap-2 rounded p-6 border border-[var(--terminal-border)] bg-[var(--terminal-surface)] relative overflow-hidden group hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.2)] hover:-translate-y-[2px] hover:bg-[var(--terminal-surface-hover)] transition-[transform,background-color,border-color,box-shadow] duration-300" style={revealDelay(STAGGER_STEP_MS)}>
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(var(--terminal-accent-rgb),1)]"></div>
        <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 blur-md pointer-events-none transition-opacity"></div>
        <div className="flex justify-between items-start z-10">
          <p className="text-[var(--terminal-text-dim)] text-xs font-mono font-medium leading-normal tracking-widest">{contentConfig.home.stats.sessionId.label}</p>
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-[20px] drop-shadow-[0_0_5px_rgba(var(--terminal-accent-rgb),0.5)] group-hover:scale-110 transition-transform">{contentConfig.home.stats.sessionId.icon}</span>
        </div>
        <p className="text-[var(--terminal-text)] tracking-light text-2xl font-bold leading-tight font-mono z-10">{userId ? `XRM-${userId}` : 'XRM--------'}</p>
        <p className="text-primary text-xs font-medium leading-normal font-mono z-10">USER: {userId || 'GUEST'}</p>
      </div>
      
      <div data-reveal className="scroll-reveal panel-draw flex min-w-[158px] flex-1 flex-col gap-2 rounded p-6 border border-[var(--terminal-border)] bg-[var(--terminal-surface)] relative overflow-hidden group hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.2)] hover:-translate-y-[2px] hover:bg-[var(--terminal-surface-hover)] transition-[transform,background-color,border-color,box-shadow] duration-300" style={revealDelay(STAGGER_STEP_MS * 2)}>
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(var(--terminal-accent-rgb),1)]"></div>
        <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 blur-md pointer-events-none transition-opacity"></div>
        <div className="flex justify-between items-start z-10">
          <p className="text-[var(--terminal-text-dim)] text-xs font-mono font-medium leading-normal tracking-widest">{contentConfig.home.stats.viewport.label}</p>
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-[20px] drop-shadow-[0_0_5px_rgba(var(--terminal-accent-rgb),0.5)] group-hover:scale-110 transition-transform">{contentConfig.home.stats.viewport.icon}</span>
        </div>
        <p className="text-[var(--terminal-text)] tracking-light text-2xl font-bold leading-tight font-mono z-10"><CountUpText value={viewport} /></p>
        <p className="text-[var(--terminal-success)] text-xs font-medium leading-normal font-mono drop-shadow-[0_0_3px_rgba(var(--terminal-success-rgb),0.5)] z-10">LIVE</p>
      </div>
      
      <div data-reveal className="scroll-reveal panel-draw flex min-w-[158px] flex-1 flex-col gap-2 rounded p-6 border border-[var(--terminal-border)] bg-[var(--terminal-surface)] relative overflow-hidden group hover:border-primary/50 hover:shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.2)] hover:-translate-y-[2px] hover:bg-[var(--terminal-surface-hover)] transition-[transform,background-color,border-color,box-shadow] duration-300" style={revealDelay(STAGGER_STEP_MS * 3)}>
        <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity shadow-[0_0_8px_rgba(var(--terminal-accent-rgb),1)]"></div>
        <div className="absolute -inset-1 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 blur-md pointer-events-none transition-opacity"></div>
        <div className="flex justify-between items-start z-10">
          <p className="text-[var(--terminal-text-dim)] text-xs font-mono font-medium leading-normal tracking-widest">{contentConfig.home.stats.responseTime.label}</p>
          <span aria-hidden="true" className="material-symbols-outlined text-primary text-[20px] drop-shadow-[0_0_5px_rgba(var(--terminal-accent-rgb),0.5)] group-hover:scale-110 transition-transform">{contentConfig.home.stats.responseTime.icon}</span>
        </div>
        <p className="text-[var(--terminal-text)] tracking-light text-2xl font-bold leading-tight font-mono z-10"><CountUpText value={responseTime} /></p>
        <p className="text-[var(--terminal-success)] text-xs font-medium leading-normal font-mono drop-shadow-[0_0_3px_rgba(var(--terminal-success-rgb),0.5)] z-10">LIVE</p>
      </div>
    </div>
  );
}
