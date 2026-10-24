import { notFound } from 'next/navigation';
import { siteConfig } from '@/config';
import PageShell, { PageHeading } from '@/components/PageShell';
import JsonLd from '@/components/JsonLd';
import Reveal from '@/components/Reveal';
import { changelogEnabled, releases } from '@/lib/changelog';
import { breadcrumbJsonLd, pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  path: '/changelog',
  title: `Changelog | ${siteConfig.fullName}`,
  description: `What changed on ${siteConfig.domain}, release by release.`,
});

const breadcrumbs = breadcrumbJsonLd([{ name: 'Changelog', path: '/changelog' }]);

export default function Changelog() {
  if (!changelogEnabled) notFound();

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <PageShell crumbs={[{ label: 'changelog.md', href: '/changelog' }]} width="medium" gap="gap-6">
        <PageHeading title=">> CHANGELOG" subtitle={`What changed on ${siteConfig.domain}, newest first.`} />
        <ol className="flex flex-col gap-4">
          {releases.map((release) => (
            <Reveal as="li" key={release.version} className="bg-[var(--terminal-surface)] border border-[var(--terminal-border)] rounded p-4 sm:p-6 font-mono">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3 pb-3 border-b border-[var(--terminal-border)]">
                <h2 className="text-[var(--terminal-text)] text-sm sm:text-base font-bold">
                  {release.version === 'Unreleased' ? 'UNRELEASED' : `v${release.version}`}
                </h2>
                <time dateTime={release.date} className="text-[var(--terminal-text-dim)] text-xs">{release.date}</time>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm leading-relaxed text-[var(--terminal-text-light)]">
                {release.changes.map((change) => <li key={change}>{change}</li>)}
              </ul>
            </Reveal>
          ))}
        </ol>
      </PageShell>
    </>
  );
}
