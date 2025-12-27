'use client';

import { useEffect, useRef, useState } from 'react';
import { animate, stagger } from 'animejs';
import Header from './components/Header';
import Footer from './components/Footer';
import InitScreen from './components/InitScreen';
import Link from 'next/link';
import { siteConfig, projects, contentConfig } from '@/config';

export default function Home() {
  const [initialized, setInitialized] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [uptime, setUptime] = useState<string>('--');
  const [responseTime, setResponseTime] = useState<string>('--');
  const [viewport, setViewport] = useState<string>('--');
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !initializedRef.current) {
      initializedRef.current = true;
      
      const initTimestamp = localStorage.getItem('iamxorum_initialized');
      const storedUserId = localStorage.getItem('iamxorum_user_id');
      
      const isInitialized = initTimestamp && (Date.now() - parseInt(initTimestamp)) < 24 * 60 * 60 * 1000;
      
      if (isInitialized && storedUserId) {
        
        setUserId(storedUserId);
        setInitialized(true);
      } else {
        
        const newUserId = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        setUserId(newUserId);
        
        localStorage.setItem('iamxorum_user_id', newUserId);
      }

      
      const fetchUptime = async () => {
        try {
          const response = await fetch('/api/uptime');
          const data = await response.json();
          setUptime(data.uptime || '--');
        } catch (error) {
          
          const sessionStart = sessionStorage.getItem('session_start_time');
          if (sessionStart) {
            const diff = Date.now() - parseInt(sessionStart);
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setUptime(`${hours}h ${minutes}m`);
          } else {
            sessionStorage.setItem('session_start_time', Date.now().toString());
            setUptime('0h 0m');
          }
        }
      };

      fetchUptime();

      
      const fetchResponseTime = async () => {
        try {
          const startTime = performance.now();
          await fetch('/api/response-time', { cache: 'no-store' });
          const endTime = performance.now();
          const measuredTime = Math.round(endTime - startTime);
          setResponseTime(`${measuredTime}ms`);
        } catch (error) {
          setResponseTime('--');
        }
      };

      fetchResponseTime();

      
      const updateViewport = () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setViewport(`${width}×${height}`);
      };

      updateViewport();
      
      window.addEventListener('resize', updateViewport);

      return () => {
        window.removeEventListener('resize', updateViewport);
        initializedRef.current = false;
      };
    }
  }, []);

  useEffect(() => {
    
    if (heroRef.current) {
      const elements = heroRef.current.querySelectorAll('h1, h2, button');
      animate(Array.from(elements), {
        opacity: [0, 0.4, 1],
        scale: [0.98, 1],
        delay: stagger(400),
        duration: 1500,
        easing: 'easeOutQuad',
      });
    }

    
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

    
    if (projectsRef.current) {
      const elements = projectsRef.current.querySelectorAll('div[class*="flex flex-1 gap-4"]');
      animate(Array.from(elements), {
        opacity: [0, 0.7, 1],
        scale: [0.98, 1],
        delay: stagger(250),
        duration: 700,
        easing: 'easeOutQuad',
      });
    }
  }, []);

  if (!initialized) {
    return <InitScreen onInit={() => setInitialized(true)} />;
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#101022] text-white group/design-root overflow-x-hidden font-display">
      {/* Background Grid Pattern Effect */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#4f4fdb 1px, transparent 1px), linear-gradient(90deg, #4f4fdb 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="px-4 sm:px-6 md:px-10 lg:px-20 xl:px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] w-full flex-1">
            {/* Hero Section */}
            <div className="@container mb-8" ref={heroRef}>
              <div className="@[480px]:p-4">
                <div className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded items-start justify-end px-4 pb-10 @[480px]:px-10 border border-[#313168] relative overflow-hidden group" style={{ backgroundImage: 'linear-gradient(rgba(16, 16, 34, 0.8) 0%, rgba(16, 16, 34, 0.95) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuDcIIzAbjAh9ugqFgD5dgaid1_VeyWEV0J3ieyQWk7EmspGGZpYf3Zq8qDAzlgezd6RGSO5PHjJm9sHXWn00c-vlj_oO4oA9-GurXdCJHtC1wRqrSmcxDjiVeXt0xj5sWaDshsYchj1dMT1QSrBJXnkmV3d5yCom2nAVSy-JopqlToKC-C9Kg5gENCR_X-n3OmlWsWTuG9u2kLBD0lj9QY4m5xulE8FtbYzwQX4ZGazyP0ELOoSWS0Ict6UbZuCySlvOgwYQrxZXzM")' }}>
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50 border border-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50 border border-green-500"></div>
                  </div>
                  <div className="flex flex-col gap-2 text-left z-10">
                    <div className="inline-flex items-center gap-2 px-2 py-1 bg-blue-900/30 border border-blue-500/30 rounded w-fit mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-blue-300 text-xs font-mono tracking-widest">SYSTEM_READY</span>
                    </div>
                      <h1 className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-[-0.033em] font-mono">
                        {contentConfig.home.hero.title}<span className="blinking-cursor text-primary">_</span>
                      </h1>
                      <h2 className="text-gray-400 text-xs sm:text-sm md:text-base lg:text-lg font-mono leading-normal max-w-full md:max-w-[600px] mt-2 whitespace-pre-line">
                        <span className="text-primary font-bold">{siteConfig.domain}</span> {contentConfig.home.hero.subtitle}
                      </h2>
                  </div>
                  <div className="flex flex-wrap gap-3 sm:gap-4 z-10">
                    <Link href={contentConfig.home.hero.ctaPrimary.link} className="flex min-w-[120px] sm:min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 bg-primary text-white text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:bg-blue-700 transition-all shadow-[0_0_20px_rgba(13,13,242,0.3)] border border-transparent hover:border-white/20">
                      <span className="truncate font-mono text-xs sm:text-sm md:text-base">{contentConfig.home.hero.ctaPrimary.text}</span>
                    </Link>
                    <Link href={contentConfig.home.hero.ctaSecondary.link || '#'} className="flex min-w-[100px] sm:min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 bg-[#181834] border-2 border-[#4f4fdb] text-[#9090cb] text-sm sm:text-base font-bold leading-normal tracking-[0.015em] hover:border-primary hover:text-primary hover:bg-[#1f1f42] hover:shadow-[0_0_15px_rgba(79,79,219,0.3)] transition-all group/cta">
                      <span className="truncate font-mono text-xs sm:text-sm md:text-base group-hover/cta:translate-x-0.5 transition-transform">{contentConfig.home.hero.ctaSecondary.text}</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            {/* Stats / System Status */}
            <div className="flex flex-wrap gap-3 sm:gap-4 p-2 sm:p-4 mb-6 sm:mb-8" ref={statsRef}>
              <div className="flex min-w-[140px] sm:min-w-[158px] flex-1 flex-col gap-2 rounded p-4 sm:p-6 border border-[#313168] bg-[#15152a] relative overflow-hidden group hover:border-primary/50 transition-colors">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 text-xs font-mono font-medium leading-normal tracking-widest">{contentConfig.home.stats.uptime.label}</p>
                  <span className="material-symbols-outlined text-primary text-[20px]">{contentConfig.home.stats.uptime.icon}</span>
                </div>
                <p className="text-white tracking-light text-2xl font-bold leading-tight font-mono">{uptime}</p>
                <p className="text-[#0bda68] text-xs font-medium leading-normal font-mono flex items-center gap-1">
                </p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded p-6 border border-[#313168] bg-[#15152a] hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 text-xs font-mono font-medium leading-normal tracking-widest">{contentConfig.home.stats.sessionId.label}</p>
                  <span className="material-symbols-outlined text-primary text-[20px]">{contentConfig.home.stats.sessionId.icon}</span>
                </div>
                <p className="text-white tracking-light text-2xl font-bold leading-tight font-mono">{userId ? `XRM-${userId}` : 'XRM--------'}</p>
                <p className="text-blue-400 text-xs font-medium leading-normal font-mono">USER: {userId || 'GUEST'}</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded p-6 border border-[#313168] bg-[#15152a] hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 text-xs font-mono font-medium leading-normal tracking-widest">{contentConfig.home.stats.viewport.label}</p>
                  <span className="material-symbols-outlined text-primary text-[20px]">{contentConfig.home.stats.viewport.icon}</span>
                </div>
                <p className="text-white tracking-light text-2xl font-bold leading-tight font-mono">{viewport}</p>
                <p className="text-green-400 text-xs font-medium leading-normal font-mono">LIVE</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded p-6 border border-[#313168] bg-[#15152a] hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start">
                  <p className="text-gray-400 text-xs font-mono font-medium leading-normal tracking-widest">{contentConfig.home.stats.responseTime.label}</p>
                  <span className="material-symbols-outlined text-primary text-[20px]">{contentConfig.home.stats.responseTime.icon}</span>
                </div>
                <p className="text-white tracking-light text-2xl font-bold leading-tight font-mono">{responseTime}</p>
                <p className="text-green-400 text-xs font-medium leading-normal font-mono">LIVE</p>
              </div>
            </div>
            {/* Projects Header */}
            <div className="px-2 sm:px-4 pt-4 sm:pt-5 pb-2">
              <div className="flex items-center gap-2 text-[#9090cb] font-mono text-xs sm:text-sm mb-2">
                <span>~/workspace</span>
                <span>/</span>
                <span className="text-white">active-projects</span>
              </div>
              <h2 className="text-white text-xl sm:text-2xl md:text-[28px] font-bold leading-tight tracking-[-0.015em] border-b border-[#313168] pb-3 sm:pb-4 flex items-center gap-2 sm:gap-3">
                <span className="text-primary">&gt;</span> ./run_projects.sh
              </h2>
            </div>
            {/* Projects Grid */}
            <div className="flex flex-col gap-6 sm:gap-10 px-2 sm:px-4 py-4 sm:py-6 @container" ref={projectsRef}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-0">
                {projects.map((project) => {
                  const statusColorMap = {
                    green: 'text-green-400',
                    yellow: 'text-yellow-400',
                    blue: 'text-blue-400',
                    orange: 'text-orange-400',
                    red: 'text-red-400',
                  };
                  
                  
                  const statuses = Array.isArray(project.status) ? project.status : [project.status];
                  const statusColors = Array.isArray(project.statusColor) ? project.statusColor : [project.statusColor];
                  
                  return (
                    <div
                      key={project.id}
                      className={`flex flex-1 gap-3 sm:gap-4 rounded border border-[#313168] bg-[#181834] p-4 sm:p-5 flex-col transition-all group relative ${
                        project.visibility === 'public' && project.link
                          ? 'hover:bg-[#1f1f42] hover:border-primary cursor-pointer'
                          : 'opacity-75 cursor-not-allowed'
                      }`}
                      onClick={() => project.visibility === 'public' && project.link && window.open(project.link, '_blank')}
                    >
                      {project.visibility === 'public' && project.link && (
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-primary">arrow_outward</span>
                        </div>
                      )}
                      {project.visibility === 'private' && (
                        <div className="absolute top-3 right-3">
                          <span className="material-symbols-outlined text-red-400 text-lg">lock</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded bg-blue-900/20 text-primary border border-primary/20">
                          <span className="material-symbols-outlined text-[28px]">{project.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-white text-lg font-bold leading-tight font-mono">{project.name}</h2>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {statuses.map((status, idx) => {
                              const color = statusColors[idx] || statusColors[0] || 'green';
                              return (
                                <span key={idx} className={`text-xs ${statusColorMap[color]} font-mono`}>
                                  {status}
                                  {idx < statuses.length - 1 && <span className="text-[#565692] mx-1">•</span>}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <p className="text-[#9090cb] text-sm font-mono leading-relaxed">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {project.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 rounded bg-[#101022] border border-[#313168] text-[10px] text-gray-400 font-mono whitespace-nowrap">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
