'use client';

import { siteConfig } from '@/config';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  
  const footerLinks = [
    ...(siteConfig.social.professional || []),
    ...(siteConfig.social.gaming || []),
    ...(siteConfig.social.other || []),
  ].filter(link => link.showInFooter !== false);
  
  return (
    <div className="px-0 py-6 sm:py-8 mt-4 border-t border-[var(--terminal-border)]">
      <div className="flex flex-col gap-3 sm:gap-4 text-[10px] sm:text-xs text-[var(--terminal-text-muted)] font-mono">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="break-all sm:break-normal">© {currentYear} {siteConfig.domain} | {siteConfig.systemVersion}</div>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            {footerLinks.map((link, index) => (
              <a
                key={index}
                className="hover:text-[var(--terminal-text)] transition-colors whitespace-nowrap"
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name.toUpperCase()}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

