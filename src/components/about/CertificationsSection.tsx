import { certifications } from '@/config';

export default function CertificationsSection() {
  if (certifications.length === 0) return null;

  return (
    <div id="certifications" className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-4 sm:p-6 scroll-mt-20">
      <h2 className="text-[var(--terminal-text)] font-mono text-base sm:text-lg font-bold mb-4 sm:mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary text-lg sm:text-xl">verified</span>
        <span className="text-sm sm:text-base">CERTIFICATIONS</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {certifications.map((cert) => (
          <div key={cert.id} className="flex items-start gap-2 sm:gap-3 p-3 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary/50 transition-colors group">
            {cert.icon && (
              <span className="material-symbols-outlined text-primary text-lg sm:text-xl group-hover:scale-110 transition-transform flex-shrink-0">
                {cert.icon}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xs sm:text-sm font-mono text-[var(--terminal-text)] font-bold mb-1 group-hover:text-primary transition-colors">
                {cert.name}
              </h3>
              <p className="text-[10px] sm:text-xs font-mono text-primary mb-1">{cert.issuer}</p>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-mono text-[var(--terminal-text-muted)]">
                <span>Issued: {cert.issueDate}</span>
                {cert.expiryDate && (
                  <>
                    <span>•</span>
                    <span>Expires: {cert.expiryDate}</span>
                  </>
                )}
                {!cert.expiryDate && <span className="text-green-400">• No expiry</span>}
              </div>
              {cert.credentialId && (
                <p className="text-[9px] sm:text-[10px] font-mono text-[var(--terminal-text-dim)] mt-1">
                  ID: {cert.credentialId}
                </p>
              )}
              {cert.credentialUrl && (
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] sm:text-[10px] font-mono text-primary hover:text-blue-400 mt-1 inline-flex items-center gap-1"
                >
                  Verify <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                </a>
              )}
              {cert.description && (
                <p className="text-[9px] sm:text-[10px] font-mono text-[var(--terminal-text-muted)] mt-2 leading-relaxed">
                  {cert.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
