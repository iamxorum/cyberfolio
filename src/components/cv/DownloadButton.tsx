interface DownloadButtonProps {
  isDownloading: boolean;
  succeeded: boolean;
  onClick: () => void;
  label?: string;
  /** `secondary` is the outlined look, for a second download beside the main one. */
  variant?: 'primary' | 'secondary';
}

const VARIANTS = {
  primary: 'bg-primary text-[var(--terminal-on-primary)] hover:bg-primary/80 shadow-[0_0_20px_rgba(var(--terminal-accent-rgb),0.3)] border border-transparent hover:border-[var(--terminal-hover-border)]',
  secondary: 'bg-[var(--terminal-surface-alt)] border-2 border-primary text-primary hover:bg-[var(--terminal-surface-hover)]',
};

export default function DownloadButton({ isDownloading, succeeded, onClick, label = 'DOWNLOAD_PDF', variant = 'primary' }: DownloadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isDownloading}
      className={`flex min-w-[140px] cursor-pointer items-center justify-center overflow-hidden rounded h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base font-bold leading-normal tracking-[0.015em] transition active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]}`}
    >
      <span className={`material-symbols-outlined text-base sm:text-lg mr-2 ${isDownloading ? 'animate-spin' : succeeded ? 'animate-pop-in' : ''}`}>
        {isDownloading ? 'progress_activity' : succeeded ? 'check' : 'download'}
      </span>
      <span className="truncate font-mono text-xs sm:text-sm md:text-base">
        {isDownloading ? 'GENERATING...' : succeeded ? 'DOWNLOADED' : label}
      </span>
    </button>
  );
}
