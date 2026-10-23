'use client';

import Link from 'next/link';
import { features, siteConfig } from '@/config';
import { eventProps } from '@/lib/track';
import EmailCTA from './EmailCTA';
import FooterTagline from './FooterTagline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    ...(siteConfig.social.professional || []),
    ...(siteConfig.social.gaming || []),
    ...(siteConfig.social.other || []),
  ].filter(link => link.showInFooter !== false);
  
  return (
    <footer className="px-0 py-6 sm:py-8 mt-4 border-t border-[var(--terminal-border)]">
      <div className="flex flex-col gap-3 sm:gap-4 text-[10px] sm:text-xs text-[var(--terminal-text-muted)] font-mono">
        {features.footerTagline && <FooterTagline />}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="break-all sm:break-normal">© {currentYear} {siteConfig.domain} | {siteConfig.systemVersion}</div>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <EmailCTA source="footer" className="hover:text-[var(--terminal-text)] transition-colors whitespace-nowrap">
              EMAIL
            </EmailCTA>
            <Link href="/privacy" className="hover:text-[var(--terminal-text)] transition-colors whitespace-nowrap">
              PRIVACY
            </Link>
            {footerLinks.map((link) => (
              <a
                key={link.url}
                className="hover:text-[var(--terminal-text)] transition-colors whitespace-nowrap"
                href={link.url}
                {...eventProps('footer_link_click', { link: link.name })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

