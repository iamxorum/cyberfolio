'use client';

import { useEffect, useRef, useState } from 'react';
import { Skill, getScoreFromLevel } from '@/config';

interface SkillsRadarProps {
  skills: Skill[];
}

const MIN_SIZE = 200;
const MAX_SIZE = 320;

export default function SkillsRadar({ skills }: SkillsRadarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState(MAX_SIZE);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const recalc = () => {
      const available = container.clientWidth;
      if (available > 0) {
        setSize(Math.max(MIN_SIZE, Math.min(MAX_SIZE, available)));
      }
    };

    recalc();
    const observer = new ResizeObserver(recalc);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const root = getComputedStyle(document.documentElement);
    const terminalBorder = root.getPropertyValue('--terminal-border').trim();
    const terminalAccent = root.getPropertyValue('--terminal-accent').trim();
    const terminalText = root.getPropertyValue('--terminal-text').trim();
    const terminalTextMuted = root.getPropertyValue('--terminal-text-muted').trim();
    const terminalBg = root.getPropertyValue('--terminal-bg').trim();
    const terminalAccentRgb = root.getPropertyValue('--terminal-accent-rgb').trim();

    const [r, g, b] = terminalAccentRgb.split(',').map(v => parseInt(v.trim()));

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - Math.max(38, size * 0.18);
    const numSkills = skills.length;
    const angleStep = (2 * Math.PI) / numSkills;


    ctx.clearRect(0, 0, size, size);


    ctx.strokeStyle = terminalBorder;
    ctx.lineWidth = 0.5;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
      ctx.stroke();
    }


    ctx.strokeStyle = terminalBorder;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < numSkills; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }


    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.2)`;
    ctx.strokeStyle = terminalAccent;
    ctx.lineWidth = 2;
    ctx.beginPath();

    skills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const score = getScoreFromLevel(skill.level);
      const skillRadius = (radius * score) / 100;
      const x = centerX + skillRadius * Math.cos(angle);
      const y = centerY + skillRadius * Math.sin(angle);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();


    ctx.fillStyle = terminalAccent;
    ctx.strokeStyle = terminalText;
    ctx.lineWidth = 1.5;
    skills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const score = getScoreFromLevel(skill.level);
      const skillRadius = (radius * score) / 100;
      const x = centerX + skillRadius * Math.cos(angle);
      const y = centerY + skillRadius * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });


    ctx.fillStyle = terminalTextMuted;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const bgHex = terminalBg.replace('#', '');
    const bgR = parseInt(bgHex.substring(0, 2), 16);
    const bgG = parseInt(bgHex.substring(2, 4), 16);
    const bgB = parseInt(bgHex.substring(4, 6), 16);

    skills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const labelRadius = radius + 35;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);

      const edgePadding = 6;
      const maxHalfWidth = Math.max(10, Math.min(x, size - x) - edgePadding);
      let label = skill.name;
      let textWidth = ctx.measureText(label).width;
      if (textWidth / 2 > maxHalfWidth) {
        while (label.length > 1 && ctx.measureText(`${label}…`).width / 2 > maxHalfWidth) {
          label = label.slice(0, -1);
        }
        label = `${label}…`;
        textWidth = ctx.measureText(label).width;
      }

      ctx.fillStyle = `rgba(${bgR}, ${bgG}, ${bgB}, 0.9)`;
      ctx.fillRect(x - textWidth / 2 - 4, y - 8, textWidth + 8, 16);


      ctx.fillStyle = terminalTextMuted;
      ctx.fillText(label, x, y);
    });


    ctx.fillStyle = terminalAccent;
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    skills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const score = getScoreFromLevel(skill.level);
      const skillRadius = (radius * score) / 100;
      const labelOffset = 18;
      const x = centerX + (skillRadius + labelOffset) * Math.cos(angle);
      const y = centerY + (skillRadius + labelOffset) * Math.sin(angle);


      ctx.fillStyle = `rgba(${bgR}, ${bgG}, ${bgB}, 0.9)`;
      const scoreText = `${score}%`;
      const textWidth = ctx.measureText(scoreText).width;
      ctx.fillRect(x - textWidth / 2 - 3, y - 7, textWidth + 6, 14);


      ctx.fillStyle = terminalAccent;
      ctx.fillText(scoreText, x, y);
    });
  }, [skills, size]);

  return (
    <div ref={containerRef} className="flex items-center justify-center p-1 sm:p-2 w-full">
      <canvas ref={canvasRef} />
    </div>
  );
}
