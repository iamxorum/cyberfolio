'use client';

import { useEffect, useRef } from 'react';
import { Skill } from '@/config/skills.config';

interface SkillsRadarProps {
  skills: Skill[];
}

export default function SkillsRadar({ skills }: SkillsRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    
    const dpr = window.devicePixelRatio || 1;
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size / 2 - 50; 
    const numSkills = skills.length;
    const angleStep = (2 * Math.PI) / numSkills;

    
    ctx.clearRect(0, 0, size, size);

    
    ctx.strokeStyle = '#313168';
    ctx.lineWidth = 0.5;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius * i) / 5, 0, 2 * Math.PI);
      ctx.stroke();
    }

    
    ctx.strokeStyle = '#313168';
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

    
    ctx.fillStyle = 'rgba(13, 13, 242, 0.2)';
    ctx.strokeStyle = '#0d0df2';
    ctx.lineWidth = 2;
    ctx.beginPath();

    skills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const skillRadius = (radius * skill.score) / 100;
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

    
    ctx.fillStyle = '#0d0df2';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    skills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const skillRadius = (radius * skill.score) / 100;
      const x = centerX + skillRadius * Math.cos(angle);
      const y = centerY + skillRadius * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });

    
    ctx.fillStyle = '#9090cb';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    skills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const labelRadius = radius + 35;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      
      
      ctx.fillStyle = 'rgba(16, 16, 34, 0.9)';
      const textWidth = ctx.measureText(skill.name).width;
      ctx.fillRect(x - textWidth / 2 - 4, y - 8, textWidth + 8, 16);
      
      
      ctx.fillStyle = '#9090cb';
      ctx.fillText(skill.name, x, y);
    });

    
    ctx.fillStyle = '#0d0df2';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    skills.forEach((skill, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const skillRadius = (radius * skill.score) / 100;
      const labelOffset = 18;
      const x = centerX + (skillRadius + labelOffset) * Math.cos(angle);
      const y = centerY + (skillRadius + labelOffset) * Math.sin(angle);
      
      
      ctx.fillStyle = 'rgba(16, 16, 34, 0.9)';
      const scoreText = `${skill.score}%`;
      const textWidth = ctx.measureText(scoreText).width;
      ctx.fillRect(x - textWidth / 2 - 3, y - 7, textWidth + 6, 14);
      
      
      ctx.fillStyle = '#0d0df2';
      ctx.fillText(scoreText, x, y);
    });
  }, [skills]);

  return (
    <div className="flex items-center justify-center p-1 sm:p-2">
      <canvas
        ref={canvasRef}
        className="max-w-full w-full"
        style={{ maxWidth: '280px' }}
      />
    </div>
  );
}

