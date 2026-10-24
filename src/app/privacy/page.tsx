import type { ReactNode } from 'react';
import { analyticsConfig, features, siteConfig } from '@/config';
import PageShell, { PageHeading } from '@/components/PageShell';
import JsonLd from '@/components/JsonLd';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  path: '/privacy',
  title: `Privacy | ${siteConfig.fullName}`,
  description: `What ${siteConfig.domain} stores in your browser and which third parties it loads content from.`,
});

const breadcrumbs = breadcrumbJsonLd([{ name: 'Privacy', path: '/privacy' }]);

// Update by hand whenever the data this site handles changes.
const LAST_UPDATED = '2026-10-23';

const hostname = (origin: string) => origin.replace(/^https?:\/\//, '').replace(/^www\./, '');

/** Hosts the page may load content from, minus the ones explained on their own (Cloudflare Turnstile). */
const thirdPartyHosts = (origins: string[]) =>
  [...new Set(origins.filter((origin) => !origin.includes('challenges.cloudflare.com')).map(hostname))].sort();

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-4 sm:p-6 font-mono">
      <h2 className="text-[var(--terminal-text)] text-sm sm:text-base font-bold mb-3 pb-3 border-b border-[var(--terminal-border)]">{title}</h2>
      <div className="flex flex-col gap-3 text-xs sm:text-sm leading-relaxed text-[var(--terminal-text-light)]">{children}</div>
    </section>
  );
}

const Code = ({ children }: { children: ReactNode }) => (
  <code className="px-1 py-0.5 rounded bg-[var(--terminal-bg)] border border-[var(--terminal-border)] text-[11px] text-[var(--terminal-text)]">{children}</code>
);

export default function Privacy() {
  const analyticsOn = features.analytics && analyticsConfig.websiteId !== '';
  const images = thirdPartyHosts(siteConfig.security.images);
  const frames = thirdPartyHosts(siteConfig.security.frames);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <PageShell crumbs={[{ label: 'privacy.txt', href: '/privacy' }]} width="medium" gap="gap-6">
        <PageHeading title=">> PRIVACY" subtitle={`What ${siteConfig.domain} stores and who it talks to. Last updated ${LAST_UPDATED}.`} />

        <Section title="THE SHORT VERSION">
          <p>
            No accounts, no ads, no tracking cookies, and nothing is sold or shared for marketing.
            {analyticsOn
              ? ' Page views are counted by a self-hosted tool that sets no cookies.'
              : ' This site does not count visitors.'}
            {' '}Below is the full list of what is stored and which other sites your browser may contact.
          </p>
          <p>The site is run by {siteConfig.fullName}.</p>
        </Section>

        <Section title="STORED IN YOUR BROWSER">
          <p>
            Small settings saved on your device, and cleared with your site data.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <Code>iamxorum_theme</Code> and <Code>iamxorum_accent</Code> (cookies): your light or dark choice and your accent colour, kept for a year.
              They are sent with page requests so the page loads already themed, and hold nothing else.
            </li>
            {features.bootScreen && (
              <li>
                <Code>iamxorum_initialized</Code> and <Code>iamxorum_user_id</Code>: that you have seen the intro animation (it is skipped for 24 hours),
                and a random number shown on the page as your &quot;ID&quot;. It is generated in your browser and not sent anywhere.
              </li>
            )}
            {features.systemStats && (
              <li><Code>session_start_time</Code> (session storage): when this visit began, for the uptime counter. Gone when you close the tab.</li>
            )}
          </ul>
          {features.turnstile && (
            <p>
              <strong className="text-[var(--terminal-text)]">One more cookie</strong>, <Code>__Host-iamxorum_access</Code>, is set only after you pass the human check.
              It is signed, HttpOnly, lasts 24 hours, and just tells the server you passed, so the CV and contact details unlock. It holds no personal data.
            </p>
          )}
        </Section>

        {analyticsOn && (
          <Section title="VISITOR STATISTICS">
            <p>
              Page views are counted with Umami, which runs on this site&apos;s own server and is reached through this domain, so no third party receives your visit.
              It uses no cookies and keeps a one-way hash of your connection, not your IP address or a profile of you.
            </p>
            <p>
              It records which pages are opened
              {analyticsConfig.events && ', and clicks on things like downloads, project links and social links'}
              {analyticsConfig.performance && ', plus page speed measurements'}.
            </p>
          </Section>
        )}

        {features.turnstile && (
          <Section title="HUMAN CHECK (CLOUDFLARE TURNSTILE)">
            <p>
              The CV and contact details sit behind a bot check from Cloudflare. When it appears, your browser loads a script from <Code>challenges.cloudflare.com</Code>,
              and Cloudflare receives your IP address and browser signals to decide if you are a person. See Cloudflare&apos;s privacy policy for how it handles that.
              The check does not run on the other pages.
            </p>
          </Section>
        )}

        <Section title="OTHER SITES YOUR BROWSER MAY CONTACT">
          <p>
            Some pages show images or embeds hosted elsewhere. Your browser requests them directly, so those sites see your IP address and browser details.
            This site does not control what they do with it.
          </p>
          {images.length > 0 && <p><strong className="text-[var(--terminal-text)]">Images:</strong> {images.join(', ')}</p>}
          {frames.length > 0 && <p><strong className="text-[var(--terminal-text)]">Embedded players:</strong> {frames.join(', ')}</p>}
        </Section>

        <Section title="SERVER SIDE">
          <ul className="list-disc pl-5 space-y-1">
            <li>Your IP address is held in memory for a short time to limit abuse (for example repeated verification attempts). It is not written to a database.</li>
            <li>Web servers and the services in front of them may keep standard access logs (IP, browser, page) for a limited time, for security and debugging.</li>
            {(features.strava || features.steam || features.githubContributions) && (
              <li>Running, gaming and GitHub activity shown on the site belong to the site owner and are fetched by the server. No visitor data is sent to those services.</li>
            )}
            <li>Contact details are never in the page source. They are returned only after the human check.</li>
          </ul>
        </Section>

        <Section title="YOUR CHOICES">
          <ul className="list-disc pl-5 space-y-1">
            <li>
              A content blocker stops the third-party images and embeds above, and the statistics too. The site keeps working
              {features.turnstile && ', except that blocking Cloudflare Turnstile means the CV and contact details cannot be unlocked'}.
            </li>
            <li>Clear this site&apos;s data in your browser at any time to remove everything listed above.</li>
            <li>Questions or removal requests: use the contact options on the About page.</li>
          </ul>
        </Section>
      </PageShell>
    </>
  );
}
