'use client';

import { useState, useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

interface InitScreenProps {
  onInit: () => void;
}

const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fullText = 'INITIALISING PAGE';

export default function InitScreen({ onInit }: InitScreenProps) {
  const [displayText, setDisplayText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);
  const onInitRef = useRef(onInit);

  useEffect(() => {
    onInitRef.current = onInit;
  });

  useEffect(() => {
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;

      localStorage.setItem('iamxorum_initialized', Date.now().toString());
      document.documentElement.classList.add('boot-skip');

      if (textRef.current) {
        textRef.current.style.animation = 'glitch 0.25s';
        textRef.current.style.transition = 'opacity 0.35s ease-in, transform 0.35s ease-in, filter 0.35s ease-in';
        textRef.current.style.opacity = '0';
        textRef.current.style.transform = 'scale(1.08) translateY(-10px)';
        textRef.current.style.filter = 'blur(8px)';
      }
      setIsExiting(true);
      setTimeout(() => onInitRef.current(), 350);
    };

    let skipEnabled = false;
    const skipGraceTimer = setTimeout(() => { skipEnabled = true; }, 400);
    const skipOnTrustedEvent = (event: Event) => {
      if (skipEnabled && event.isTrusted) finish();
    };

    if (prefersReducedMotion()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayText(fullText);
      const holdTimeout = setTimeout(finish, 300);
      window.addEventListener('keydown', skipOnTrustedEvent);
      window.addEventListener('click', skipOnTrustedEvent);
      return () => {
        clearTimeout(holdTimeout);
        clearTimeout(skipGraceTimer);
        window.removeEventListener('keydown', skipOnTrustedEvent);
        window.removeEventListener('click', skipOnTrustedEvent);
      };
    }

    const scrambleDuration = 300;
    const revealSpeed = 35;
    const holdAfterReveal = 200;
    const startTime = Date.now();
    const charMap: string[] = [];
    let currentIndex = 0;

    for (let i = 0; i < fullText.length; i++) {
      charMap[i] = chars[Math.floor(Math.random() * chars.length)];
    }

    const updateText = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed < scrambleDuration) {
        let scrambled = '';
        for (let i = 0; i < fullText.length; i++) {
          if (Math.random() > 0.4) charMap[i] = chars[Math.floor(Math.random() * chars.length)];
          scrambled += charMap[i];
        }
        setDisplayText(scrambled);
        return;
      }

      const revealElapsed = elapsed - scrambleDuration;
      const newIndex = Math.min(Math.floor(revealElapsed / revealSpeed), fullText.length);

      if (newIndex > currentIndex) {
        currentIndex = newIndex;
        let revealed = '';
        for (let i = 0; i < fullText.length; i++) {
          if (i < currentIndex) {
            revealed += fullText[i];
          } else {
            if (Math.random() > 0.7) charMap[i] = chars[Math.floor(Math.random() * chars.length)];
            revealed += charMap[i];
          }
        }
        setDisplayText(revealed);
      }

      if (currentIndex >= fullText.length) {
        clearInterval(scrambleInterval);
        setTimeout(finish, holdAfterReveal);
      }
    };

    const scrambleInterval = setInterval(updateText, 40);

    // Let an impatient visitor skip straight to the site.
    window.addEventListener('keydown', skipOnTrustedEvent);
    window.addEventListener('click', skipOnTrustedEvent);

    return () => {
      clearInterval(scrambleInterval);
      clearTimeout(skipGraceTimer);
      window.removeEventListener('keydown', skipOnTrustedEvent);
      window.removeEventListener('click', skipOnTrustedEvent);
    };
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => setCursorVisible((prev) => !prev), 400);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div
      className={`boot-screen-overlay fixed inset-0 z-[9999] bg-[var(--terminal-bg-dark)] flex items-center justify-center font-mono transition-opacity duration-300 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="matrix-bg w-full h-full"></div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[2px] animate-scan"></div>

      <div ref={textRef} className="relative z-10 text-center px-4">
        <div className="text-primary text-3xl sm:text-5xl md:text-6xl font-bold tracking-wider font-mono">
          {displayText}
          {cursorVisible && <span className="text-primary animate-pulse">_</span>}
        </div>
      </div>
    </div>
  );
}
