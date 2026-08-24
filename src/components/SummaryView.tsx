/* Hallmark · genre: modern-minimal · macrostructure: Marquee Hero (adapted: short subhead kept, no fold CTA)
 * nav: N1a Wordmark + 2 links (justified — only 2 real destinations from this page) · footer: Ft2 Inline single line
 * theme: custom Coral-family (no source CSS retrievable via WebFetch on sebastiannichtern.com — DNA source is
 *   structural/rhythm only, not tokens) · paper oklch(97% 0.010 40) · accent oklch(58% 0.19 27) warm-coral
 * display: Inter Tight 700 · body: Inter 400 · enrichment: Tier B hand-built SVG (2-ellipse hand-drawn circle,
 *   used once — restraint, not scattered) · studied: partial (structure from study.md URL-mode pass, tokens own)
 * motion: none — project has a standing "no entrance animations" policy (see Architecture.md); only
 *   interaction press/focus feedback ships, no scroll reveals, no counters
 */
import { Inter, Inter_Tight } from 'next/font/google';
import Link from 'next/link';
import { siteConfig, experience, projects, certifications, cvConfig } from '@/config';
import { getContactInfo } from '@/lib/cv-helpers';

const interTight = Inter_Tight({ subsets: ['latin'], weight: ['600', '700'], variable: '--font-summary-display' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-summary-body' });

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

function parseMonthYear(value: string): Date {
  const [monthStr, yearStr] = value.trim().split(/\s+/);
  const month = MONTHS[(monthStr || '').slice(0, 3).toLowerCase()] ?? 0;
  return new Date(parseInt(yearStr, 10) || 0, month, 1);
}

function getYearsExperience(): number {
  const earliestStart = experience
    .map((e) => parseMonthYear(e.startDate))
    .reduce((min, d) => (d < min ? d : min));
  const now = new Date();
  const totalMonths = (now.getFullYear() - earliestStart.getFullYear()) * 12 + (now.getMonth() - earliestStart.getMonth());
  return Math.floor(totalMonths / 12);
}

const experienceHighlights: Record<string, string> = {
  exp_1: 'Started in technical support, solving real customer problems — the foundation for everything since.',
  exp_2: 'Rebuilt an internal tool from the ground up and automated a multi-day manual process down to a few hours.',
  exp_3: 'Keeps banking infrastructure running on Google Cloud and OpenShift — gets paged when something breaks, and works to make sure it doesn\'t happen again.',
};

/** Hand-drawn annotation mark — two slightly offset, hand-authored ellipses (Tier B SVG). Used once, in the hero, on purpose. */
function HandDrawnCircle() {
  return (
    <svg
      viewBox="0 0 220 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute -inset-x-3 -inset-y-3 -z-10 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] sm:-inset-x-5 sm:-inset-y-4 sm:h-[calc(100%+2rem)] sm:w-[calc(100%+2.5rem)]"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="110" cy="50" rx="104" ry="42" stroke="var(--summary-accent)" strokeWidth="3" strokeLinecap="round" transform="rotate(-3 110 50)" opacity="0.55" />
      <ellipse cx="113" cy="48" rx="99" ry="37" stroke="var(--summary-accent)" strokeWidth="2.5" strokeLinecap="round" transform="rotate(2 113 48)" opacity="0.35" />
    </svg>
  );
}

const linkClass = 'transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--summary-accent)] rounded-sm';

export default function SummaryView() {
  const yearsExperience = getYearsExperience();
  const publicProjects = projects.filter((p) => p.visibility === 'public');
  const companiesCount = new Set(experience.map((e) => e.company)).size;
  const contactInfo = getContactInfo(siteConfig, cvConfig.email);
  const email = contactInfo.personal.find((item) => item.href?.startsWith('mailto:'));
  const secondaryContact = [...contactInfo.personal, ...contactInfo.links].filter((item) => item !== email);

  const summaryVars = {
    '--summary-paper': 'oklch(97% 0.010 40)',
    '--summary-paper-2': 'oklch(93.5% 0.012 40)',
    '--summary-rule': 'oklch(84% 0.012 40)',
    '--summary-ink': 'oklch(20% 0.014 35)',
    '--summary-ink-muted': 'oklch(42% 0.012 38)',
    '--summary-accent': 'oklch(58% 0.19 27)',
    '--summary-accent-ink': 'oklch(99% 0.006 45)',
  } as React.CSSProperties;

  return (
    <div
      className={`${interTight.variable} ${inter.variable} min-h-screen overflow-x-clip`}
      style={{ ...summaryVars, backgroundColor: 'var(--summary-paper)', color: 'var(--summary-ink)', fontFamily: 'var(--font-summary-body), sans-serif' }}
    >
      <a
        href="#main-content"
        className={`fixed top-2 -left-[9999px] focus:left-2 z-[100] px-4 py-2 rounded text-sm font-bold ${linkClass}`}
        style={{ backgroundColor: 'var(--summary-accent)', color: 'var(--summary-accent-ink)' }}
      >
        Skip to content
      </a>

      {/* Nav — N1a wordmark + 2 links, standalone (not the site's terminal header) */}
      <header className="mx-auto flex max-w-[1120px] items-center justify-between px-6 py-6 sm:px-10 sm:py-8">
        <span className="font-semibold" style={{ fontFamily: 'var(--font-summary-display), sans-serif' }}>{siteConfig.fullName}</span>
        <nav className="flex items-center gap-4 text-sm sm:gap-6" aria-label="Primary">
          <Link href="/cv" prefetch={false} className={`font-medium ${linkClass}`} style={{ color: 'var(--summary-ink-muted)' }}>
            Résumé ↓
          </Link>
          <Link href="/" className={`font-medium ${linkClass}`} style={{ color: 'var(--summary-ink-muted)' }}>
            Full site ↗
          </Link>
        </nav>
      </header>

      <main id="main-content" className="mx-auto max-w-[1120px] px-6 sm:px-10">
        {/* Hero — Marquee: one statement, no fold CTA */}
        <section className="pt-10 pb-14 sm:pt-16 sm:pb-20">
          <p className="text-sm font-medium tracking-wide" style={{ color: 'var(--summary-ink-muted)' }}>
            {siteConfig.role} · based in {siteConfig.location}
          </p>
          <h1
            className="mt-4 max-w-[18ch] font-bold break-words"
            style={{ fontFamily: 'var(--font-summary-display), sans-serif', fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', lineHeight: 1.02, letterSpacing: '-0.03em' }}
          >
            Keeps production systems{' '}
            <span className="relative inline-block px-1">
              <HandDrawnCircle />
              online
            </span>
            .
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg sm:text-xl" style={{ color: 'var(--summary-ink-muted)', lineHeight: 1.5 }}>
            {yearsExperience}+ years in production infrastructure — and automating the parts that shouldn&apos;t need a human.
          </p>
        </section>

        <hr style={{ borderColor: 'var(--summary-ink)', borderTopWidth: '2px' }} />

        {/* Supporting stats */}
        <section className="grid grid-cols-2 gap-3 py-10 sm:grid-cols-4 sm:gap-4 sm:py-14">
          {[
            { value: `${yearsExperience}+`, label: 'years experience' },
            { value: publicProjects.length, label: 'shipped projects' },
            { value: certifications.length, label: 'certifications' },
            { value: companiesCount, label: 'companies' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border px-4 py-6 text-center sm:px-6 sm:py-8"
              style={{ backgroundColor: 'var(--summary-paper-2)', borderColor: 'var(--summary-rule)' }}
            >
              <div className="font-bold tabular-nums" style={{ fontFamily: 'var(--font-summary-display), sans-serif', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', letterSpacing: '-0.02em' }}>
                {stat.value}
              </div>
              <div className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--summary-ink-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Experience */}
        <section className="py-10 sm:py-14">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--summary-ink-muted)' }}>Experience</h2>
          <div className="mt-6 flex flex-col gap-4">
            {experience.map((exp) => (
              <div
                key={exp.id}
                className="rounded-2xl border p-6"
                style={{ backgroundColor: 'var(--summary-paper-2)', borderColor: 'var(--summary-rule)', boxShadow: '0 1px 2px oklch(20% 0.014 35 / 0.05)' }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-semibold" style={{ fontFamily: 'var(--font-summary-display), sans-serif' }}>{exp.role} · {exp.company}</p>
                  <p className="text-sm tabular-nums" style={{ color: 'var(--summary-ink-muted)' }}>{exp.startDate} – {exp.endDate === 'ongoing' ? 'present' : exp.endDate}</p>
                </div>
                <p className="mt-2 max-w-[65ch]" style={{ color: 'var(--summary-ink-muted)', lineHeight: 1.6 }}>
                  {experienceHighlights[exp.id] || exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Selected projects */}
        <section className="py-10 sm:py-14">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--summary-ink-muted)' }}>Selected projects</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {publicProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border p-6"
                style={{ backgroundColor: 'var(--summary-paper-2)', borderColor: 'var(--summary-rule)', boxShadow: '0 1px 2px oklch(20% 0.014 35 / 0.05)' }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-semibold" style={{ fontFamily: 'var(--font-summary-display), sans-serif' }}>{project.name}</p>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-medium ${linkClass}`}
                      style={{ color: 'var(--summary-accent)' }}
                    >
                      View →
                    </a>
                  )}
                </div>
                <p className="mt-2" style={{ color: 'var(--summary-ink-muted)', lineHeight: 1.6 }}>{project.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact — one job, one button */}
        <section id="contact" className="py-14 sm:py-20 scroll-mt-20">
          <div
            className="rounded-3xl border px-6 py-12 text-center sm:px-16 sm:py-16"
            style={{ backgroundColor: 'var(--summary-paper-2)', borderColor: 'var(--summary-rule)' }}
          >
            <h2 className="font-bold" style={{ fontFamily: 'var(--font-summary-display), sans-serif', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', letterSpacing: '-0.02em' }}>
              Let&apos;s talk.
            </h2>
            <p className="mx-auto mt-3 max-w-[40ch]" style={{ color: 'var(--summary-ink-muted)', lineHeight: 1.6 }}>
              No form, no funnel — just an email.
            </p>
            {email && (
              <a
                href={email.href}
                className={`mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold ${linkClass}`}
                style={{ backgroundColor: 'var(--summary-accent)', color: 'var(--summary-accent-ink)' }}
              >
                Email me →
              </a>
            )}
            {secondaryContact.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm" style={{ color: 'var(--summary-ink-muted)' }}>
                {secondaryContact.map((item) => (
                  item.href ? (
                    <a
                      key={item.text}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className={linkClass}
                    >
                      {item.text}
                    </a>
                  ) : (
                    <span key={item.text}>{item.text}</span>
                  )
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer — Ft2 inline single line */}
      <footer className="mx-auto max-w-[1120px] px-6 py-8 sm:px-10" style={{ borderTop: '1px solid var(--summary-rule)' }}>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs" style={{ color: 'var(--summary-ink-muted)' }}>
          <span>© {new Date().getFullYear()} {siteConfig.fullName}</span>
          <span>Prefer the interactive version? <Link href="/" className={`font-medium underline underline-offset-2 ${linkClass}`} style={{ color: 'var(--summary-ink)' }}>iamxorum.ro →</Link></span>
        </div>
      </footer>
    </div>
  );
}
