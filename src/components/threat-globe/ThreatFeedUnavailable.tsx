export default function ThreatFeedUnavailable() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 mb-8 border border-[var(--terminal-border)] rounded bg-[rgba(var(--terminal-bg-rgb),0.60)] text-center font-mono">
      <span className="material-symbols-outlined text-3xl text-[var(--terminal-text-dim)]">satellite_alt</span>
      <p className="text-sm text-[var(--terminal-text-dim)]">Threat feed unavailable</p>
      <p className="text-xs text-[var(--terminal-text-muted)] max-w-xs">
        Live firewall data couldn&apos;t be loaded right now...
      </p>
    </div>
  );
}
