/** A pulsing placeholder block for a section that is still loading. */
export default function Bone({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-[var(--terminal-surface-alt)] ${className}`} />;
}
