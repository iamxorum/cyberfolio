'use client';

import { useState, useEffect, useRef } from 'react';

interface InitScreenProps {
  onInit: () => void;
}

const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export default function InitScreen({ onInit }: InitScreenProps) {
  const [displayText, setDisplayText] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({
    modules: 0,
    connection: 0,
    booting: 0,
    currentStep: 0
  });
  const fullText = 'INITIALISING PAGE';
  const textRef = useRef<HTMLDivElement>(null);
  const scrambleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let currentIndex = 0;
    const scrambleDuration = 1000; 
    const revealSpeed = 100; 

    const startTime = Date.now();
    const charMap: string[] = []; 

    
    for (let i = 0; i < fullText.length; i++) {
      charMap[i] = chars[Math.floor(Math.random() * chars.length)];
    }

    const updateText = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < scrambleDuration) {
        
        if (Math.random() > 0.7) { 
          let scrambled = '';
          for (let i = 0; i < fullText.length; i++) {
            
            if (Math.random() > 0.5) {
              charMap[i] = chars[Math.floor(Math.random() * chars.length)];
            }
            scrambled += charMap[i];
          }
          setDisplayText(scrambled);
        }
      } else {
        
        const revealElapsed = elapsed - scrambleDuration;
        const newIndex = Math.min(
          Math.floor(revealElapsed / revealSpeed),
          fullText.length
        );

        if (newIndex > currentIndex) {
          currentIndex = newIndex;
          let revealed = '';
          for (let i = 0; i < fullText.length; i++) {
            if (i < currentIndex) {
              revealed += fullText[i];
            } else {
              
              if (Math.random() > 0.8) {
                charMap[i] = chars[Math.floor(Math.random() * chars.length)];
              }
              revealed += charMap[i];
            }
          }
          setDisplayText(revealed);
        }

        if (currentIndex >= fullText.length) {
          
          if (scrambleIntervalRef.current) {
            clearInterval(scrambleIntervalRef.current);
          }
          setTimeout(() => {
            setShowPrompt(true);
          }, 500);
        }
      }
    };

    scrambleIntervalRef.current = setInterval(updateText, 80); 

    return () => {
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    
    const cursorInterval = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    if (showPrompt && textRef.current) {
      
      textRef.current.style.opacity = '0';
      textRef.current.style.transform = 'scale(0.95)';
      
      requestAnimationFrame(() => {
        if (textRef.current) {
          textRef.current.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
          textRef.current.style.opacity = '1';
          textRef.current.style.transform = 'scale(1)';
        }
      });
    }
  }, [showPrompt]);

  useEffect(() => {
    if (!showPrompt) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleInit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPrompt]);

  function handleInit() {
    setIsLoading(true);
    
    
    if (textRef.current) {
      
      textRef.current.style.animation = 'glitch 0.3s';
      
      setTimeout(() => {
        
        if (textRef.current) {
          textRef.current.style.transition = 'opacity 0.6s ease-in, transform 0.6s ease-in, filter 0.6s ease-in';
          textRef.current.style.opacity = '0';
          textRef.current.style.transform = 'scale(1.1) translateY(-20px)';
          textRef.current.style.filter = 'blur(10px)';
        }
      }, 300);
    }

    
    let progress = 0;
    const totalDuration = 3000; 
    const updateInterval = 30; 

    const loadingInterval = setInterval(() => {
      progress += (100 / (totalDuration / updateInterval));

      if (progress <= 33.33) {
        
        setLoadingProgress({
          modules: Math.min(progress * 3, 100),
          connection: 0,
          booting: 0,
          currentStep: 0
        });
      } else if (progress <= 66.66) {
        
        setLoadingProgress({
          modules: 100,
          connection: Math.min((progress - 33.33) * 3, 100),
          booting: 0,
          currentStep: 1
        });
      } else {
        
        setLoadingProgress({
          modules: 100,
          connection: 100,
          booting: Math.min((progress - 66.66) * 3, 100),
          currentStep: 2
        });
      }

      if (progress >= 100) {
        clearInterval(loadingInterval);
        
        if (typeof window !== 'undefined') {
          const timestamp = Date.now();
          localStorage.setItem('iamxorum_initialized', timestamp.toString());
        }
        setTimeout(() => {
          onInit();
        }, 300);
      }
    }, updateInterval);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[var(--terminal-bg-dark)] flex items-center justify-center font-mono">
      {/* Matrix background effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="matrix-bg w-full h-full"></div>
      </div>
      
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[2px] animate-scan"></div>

      {/* Loading overlay when initializing */}
      {isLoading && (
        <div className="absolute inset-0 bg-[var(--terminal-bg-dark)] flex items-center justify-center z-20">
          <div className="text-center w-full max-w-2xl px-4">
            {/* Terminal-style loading */}
            <div className="border border-[var(--terminal-border)] bg-[var(--terminal-bg-dark)] p-6 rounded font-mono">
              <div className="text-left space-y-3">
                <div className="text-green-400 text-sm">
                  <span className="text-primary">root@system:~$</span> initializing...
                </div>
                <div className="text-[var(--terminal-text-muted)] text-xs space-y-3">
                  {/* Step 1: Loading modules */}
                  <div className="flex items-center gap-3">
                    <span className="text-primary w-2">{loadingProgress.currentStep >= 0 ? '[' : ' '}</span>
                    <div className="w-48 bg-[var(--terminal-surface)] border border-[var(--terminal-border)] h-2 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-300 ease-out"
                        style={{ width: `${loadingProgress.modules}%` }}
                      ></div>
                    </div>
                    <span className="text-primary w-2">{loadingProgress.currentStep >= 0 ? ']' : ' '}</span>
                    <span className="text-green-400 min-w-[140px] text-left">
                      Loading modules... {Math.round(loadingProgress.modules)}%
                    </span>
                  </div>
                  
                  {/* Step 2: Establishing connection */}
                  <div className="flex items-center gap-3">
                    <span className="text-primary w-2">{loadingProgress.currentStep >= 1 ? '[' : ' '}</span>
                    <div className="w-48 bg-[var(--terminal-surface)] border border-[var(--terminal-border)] h-2 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-300 ease-out"
                        style={{ width: `${loadingProgress.connection}%` }}
                      ></div>
                    </div>
                    <span className="text-primary w-2">{loadingProgress.currentStep >= 1 ? ']' : ' '}</span>
                    <span className="text-green-400 min-w-[140px] text-left">
                      Establishing connection... {Math.round(loadingProgress.connection)}%
                    </span>
                  </div>
                  
                  {/* Step 3: Booting system */}
                  <div className="flex items-center gap-3">
                    <span className="text-primary w-2">{loadingProgress.currentStep >= 2 ? '[' : ' '}</span>
                    <div className="w-48 bg-[var(--terminal-surface)] border border-[var(--terminal-border)] h-2 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-300 ease-out"
                        style={{ width: `${loadingProgress.booting}%` }}
                      ></div>
                    </div>
                    <span className="text-primary w-2">{loadingProgress.currentStep >= 2 ? ']' : ' '}</span>
                    <span className="text-green-400 min-w-[140px] text-left">
                      Booting system... {Math.round(loadingProgress.booting)}%
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-primary text-sm font-bold tracking-widest">
                  &gt; SYSTEM_INITIALIZING
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 text-center" ref={textRef}>
        <div className="mb-8">
          <div className="text-primary text-4xl md:text-6xl font-bold tracking-wider mb-4 font-mono">
            {displayText}
            {cursorVisible && !isLoading && <span className="text-primary animate-pulse">_</span>}
          </div>
          
          {showPrompt && !isLoading && (
            <div className="mt-8 space-y-4 animate-fade-in">
              <div className="text-[var(--terminal-text-muted)] text-sm md:text-base">
                <div className="mb-4">
                  <span className="text-green-400">[SYSTEM]</span> Ready to initialize...
                </div>
                <div className="text-xs md:text-sm text-[var(--terminal-text-dim)]">
                  Press <kbd className="px-2 py-1 bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded text-primary">ENTER</kbd> or <kbd className="px-2 py-1 bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded text-primary">SPACE</kbd> to continue
                </div>
                <div className="mt-6">
                  <button
                    onClick={handleInit}
                    className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-bold tracking-wider rounded border border-primary/30 shadow-[0_0_15px_rgba(var(--terminal-accent-rgb),0.4)] transition-all hover:scale-105"
                  >
                    &gt; INITIALIZE
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
