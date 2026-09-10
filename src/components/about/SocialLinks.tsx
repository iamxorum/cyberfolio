import { siteConfig, type SocialLink } from '@/config';

function SocialLinkGroup({ title, links }: { title: string; links: SocialLink[] }) {
  return (
    <div>
      <div className="text-[var(--terminal-text-dim)] text-[9px] mb-1.5 uppercase">{title}</div>
      <div className="flex flex-col gap-2">
        {links.map((link, index) => {
          const isMailto = link.url.startsWith('mailto:');
          return (
            <a
              key={index}
              href={link.url}
              target={isMailto ? undefined : '_blank'}
              rel={isMailto ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-2 px-2 py-1.5 rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary hover:bg-primary/10 transition-all group"
            >
              {link.icon && (
                <span className="material-symbols-outlined text-[var(--terminal-text-muted)] group-hover:text-primary text-base">{link.icon}</span>
              )}
              <span className="text-[var(--terminal-text-muted)] group-hover:text-primary text-[10px] sm:text-xs">{link.name}</span>
              {!isMailto && (
                <span className="ml-auto material-symbols-outlined text-[var(--terminal-text-dim)] group-hover:text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity">arrow_outward</span>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

export default function SocialLinks() {
  const { professional, gaming, other } = siteConfig.social;
  const hasAny = (professional?.length ?? 0) > 0 || (gaming?.length ?? 0) > 0 || (other?.length ?? 0) > 0;

  if (!hasAny) return null;

  return (
    <div className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-3 sm:p-4 font-mono text-xs">
      <div className="flex items-center gap-2 mb-3 border-b border-[var(--terminal-border)] pb-2">
        <span className="material-symbols-outlined text-primary text-base">link</span>
        <span className="text-[var(--terminal-text-dim)] text-[10px] sm:text-xs">SOCIAL_LINKS</span>
      </div>
      <div className="flex flex-col gap-3">
        {professional && professional.length > 0 && <SocialLinkGroup title="Professional" links={professional} />}
        {gaming && gaming.length > 0 && <SocialLinkGroup title="Gaming" links={gaming} />}
        {other && other.length > 0 && <SocialLinkGroup title="Other" links={other} />}
      </div>
    </div>
  );
}
