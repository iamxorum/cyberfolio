import Image from 'next/image';
import { siteConfig, hobbies } from '@/config';
import { useProfileAge } from '@/hooks/useProfileAge';

interface ProfileCardProps {
  userId: string;
}

export default function ProfileCard({ userId }: ProfileCardProps) {
  const age = useProfileAge();

  return (
    <div className="animate-reveal bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-1 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-[20%] w-full animate-scan pointer-events-none z-10 opacity-30"></div>
      <div className="relative bg-[var(--terminal-bg-dark)] aspect-square flex items-center justify-center overflow-hidden mb-0">
        <div className="absolute inset-0 bg-noise-texture opacity-20"></div>
        <Image
          src={siteConfig.profileImage}
          alt="Profile"
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          priority
        />
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="text-[10px] font-mono text-[var(--terminal-text)]">ID: {userId || '------'}</div>
        </div>
      </div>
      <div className="p-4 border-t border-[var(--terminal-border)] space-y-2 sm:space-y-2.5">
        <div className="text-center">
          <h1 className="text-[var(--terminal-text)] font-mono text-lg sm:text-xl font-bold tracking-widest glow-text">{siteConfig.username.toUpperCase()}</h1>
        </div>
        <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm font-mono">
          <div className="flex items-center justify-between border-b border-[var(--terminal-border)] pb-1.5">
            <span className="text-[var(--terminal-text-dim)]">AGE_DAYS:</span>
            <span className="text-[var(--terminal-text)]">{age || '--'}</span>
          </div>
          <div className="flex items-center justify-between border-b border-[var(--terminal-border)] pb-1.5">
            <span className="text-[var(--terminal-text-dim)]">LOCATION:</span>
            <span className="text-[var(--terminal-text)]">{siteConfig.location}</span>
          </div>
          <div className="flex items-center justify-between border-b border-[var(--terminal-border)] pb-1.5">
            <span className="text-[var(--terminal-text-dim)]">ROLE:</span>
            <span className="text-primary">{siteConfig.role}</span>
          </div>
          <div className="flex items-center justify-between border-b border-[var(--terminal-border)] pb-1.5">
            <span className="text-[var(--terminal-text-dim)]">STATUS:</span>
            <span className="text-green-400">{siteConfig.status}</span>
          </div>
          <div className="pt-1">
            <div className="text-[var(--terminal-text-dim)] mb-1.5">INTERESTED:</div>
            <div className="flex flex-wrap gap-1.5">
              {hobbies.slice(0, 3).map((hobby, index) => (
                <span key={index} className="px-1.5 py-0.5 rounded bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[10px] text-[var(--terminal-text-muted)]">
                  {hobby.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
