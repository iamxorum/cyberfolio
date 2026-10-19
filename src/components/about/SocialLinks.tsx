import { siteConfig, type SocialLink } from '@/config';
import Reveal from '@/components/Reveal';
import { eventProps } from '@/lib/track';
import { STAGGER_STEP_DENSE_MS, revealDelay } from '@/lib/motion';

const MAX_STAGGERED = 8;

/** `offset` is how many links precede this group, so the stagger runs on across groups. */
function SocialLinkGroup({ title, links, offset }: { title: string; links: SocialLink[]; offset: number }) {
  return (
    <div data-reveal style={revealDelay(Math.min(offset, MAX_STAGGERED) * STAGGER_STEP_DENSE_MS)} className="scroll-reveal">
      <div className="text-[var(--terminal-text-dim)] text-[9px] mb-1.5 uppercase">{title}</div>
      <div className="flex flex-col gap-2">
        {links.map((link, index) => {
          const isMailto = link.url.startsWith('mailto:');
          return (
            <a
              key={link.url}
              data-reveal
              {...eventProps('social_click', { link: link.name })}
              style={revealDelay(Math.min(offset + index, MAX_STAGGERED) * STAGGER_STEP_DENSE_MS)}
              href={link.url}
              target={isMailto ? undefined : '_blank'}
              rel={isMailto ? undefined : 'noopener noreferrer'}
              className="flex items-center gap-2 px-2 py-1.5 scroll-reveal rounded border border-[var(--terminal-border)] bg-[var(--terminal-bg)] hover:border-primary hover:bg-primary/10 transition group"
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

  const proCount = professional?.length ?? 0;
  const gamingCount = gaming?.length ?? 0;

  return (
    <Reveal draw className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-3 sm:p-4 font-mono text-xs">
      <div className="flex items-center gap-2 mb-3 border-b border-[var(--terminal-border)] pb-2">
        <span className="material-symbols-outlined text-primary text-base">link</span>
        <span className="text-[var(--terminal-text-dim)] text-[10px] sm:text-xs">SOCIAL_LINKS</span>
      </div>
      <div className="flex flex-col gap-3">
        {professional && professional.length > 0 && <SocialLinkGroup title="Professional" links={professional} offset={0} />}
        {gaming && gaming.length > 0 && <SocialLinkGroup title="Gaming" links={gaming} offset={proCount} />}
        {other && other.length > 0 && <SocialLinkGroup title="Other" links={other} offset={proCount + gamingCount} />}
      </div>
    </Reveal>
  );
}
