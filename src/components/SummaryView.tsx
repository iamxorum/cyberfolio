import { Inter, Inter_Tight } from 'next/font/google';
import Link from 'next/link';
import { siteConfig, experience, education, projects, certifications, cvConfig } from '@/config';
import { getContactInfo, filterForCV, sortExperienceByDate } from '@/lib/cv-helpers';

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

function SummaryMotionStyle() {
  return (
    <style>{`
      @keyframes summary-draw { to { stroke-dashoffset: 0; } }
      .summary-hand-drawn ellipse, .summary-hand-drawn path {
        stroke-dasharray: 600;
        stroke-dashoffset: 600;
        animation: summary-draw 750ms cubic-bezier(0.16, 1, 0.3, 1) 150ms forwards;
      }

      @keyframes summary-rise {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .summary-reveal {
        opacity: 0;
        animation: summary-rise 650ms cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @media (prefers-reduced-motion: reduce) {
        .summary-hand-drawn ellipse, .summary-hand-drawn path {
          stroke-dashoffset: 0;
          animation: none;
        }
        .summary-reveal {
          opacity: 1;
          transform: none;
          animation: none;
        }
      }
    `}</style>
  );
}

function HandDrawnCircle() {
  return (
    <svg
      viewBox="0 0 220 100"
      preserveAspectRatio="none"
      className="summary-hand-drawn pointer-events-none absolute -inset-x-3 -inset-y-3 -z-10 h-[calc(100%+1.5rem)] w-[calc(100%+1.5rem)] sm:-inset-x-5 sm:-inset-y-4 sm:h-[calc(100%+2rem)] sm:w-[calc(100%+2.5rem)]"
      fill="none"
      aria-hidden="true"
    >
      <ellipse cx="110" cy="50" rx="104" ry="42" stroke="var(--summary-accent)" strokeWidth="3" strokeLinecap="round" transform="rotate(-3 110 50)" opacity="0.55" />
      <ellipse cx="113" cy="48" rx="99" ry="37" stroke="var(--summary-accent)" strokeWidth="2.5" strokeLinecap="round" transform="rotate(2 113 48)" opacity="0.35" />
    </svg>
  );
}

function HandDrawnUnderline() {
  return (
    <svg
      viewBox="0 0 140 12"
      preserveAspectRatio="none"
      className="summary-hand-drawn pointer-events-none absolute -bottom-1.5 left-0 h-[8px] w-full"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 7 C 20 3, 35 10, 52 6 S 85 2, 100 7 S 125 10, 138 5"
        stroke="var(--summary-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

const linkClass = 'transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--summary-accent)] rounded-sm';
const cardClass = 'rounded-2xl border p-6 shadow-[0_1px_2px_oklch(20%_0.014_35_/_0.05)] hover:shadow-[0_6px_20px_oklch(20%_0.014_35_/_0.10)] transition duration-200';

function revealDelay(stepMs: number, index = 0): React.CSSProperties {
  return { animationDelay: `${index * stepMs}ms` };
}

type ChannelIconName = 'mail' | 'phone' | 'linkedin' | 'github' | 'globe';

function channelIcon(href: string): ChannelIconName {
  if (href.startsWith('mailto:')) return 'mail';
  if (href.startsWith('tel:')) return 'phone';
  if (href.includes('linkedin.com')) return 'linkedin';
  if (href.includes('github.com')) return 'github';
  return 'globe';
}

function ContactIcon({ name, className }: { name: ChannelIconName; className?: string }) {
  if (name === 'github') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    );
  }
  if (name === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }
  if (name === 'mail') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </svg>
    );
  }
  if (name === 'phone') {
    return (
      <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1.2 1.2 0 0 1 1.2-.3c1.3.4 2.7.7 4.1.7.7 0 1.3.6 1.3 1.3V21c0 .7-.6 1.3-1.3 1.3C10.7 22.3 1.7 13.3 1.7 2.3 1.7 1.6 2.3 1 3 1h3.7c.7 0 1.3.6 1.3 1.3 0 1.4.2 2.8.7 4.1.1.4 0 .9-.3 1.2L6.6 10.8Z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.8 6 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-6-3.8-9S9.5 5.7 12 3Z" />
    </svg>
  );
}

export default function SummaryView() {
  const yearsExperience = getYearsExperience();
  const publicProjects = projects.filter((p) => p.visibility === 'public');
  const shippedProjects = publicProjects.filter((p) => p.projectType === 'personal');
  const contributionProjects = publicProjects.filter((p) => p.projectType === 'contribution');
  const sortedExperience = sortExperienceByDate(experience);
  const contactInfo = getContactInfo(siteConfig, cvConfig.email);
  const email = contactInfo.personal.find((item) => item.href?.startsWith('mailto:'));
  const socialChannels = [...contactInfo.personal, ...contactInfo.links].filter((item) => item.href && item !== email);
  const summaryEducation = filterForCV(education);

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
      <SummaryMotionStyle />
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
          <p className="summary-reveal text-sm font-medium tracking-wide" style={{ color: 'var(--summary-ink-muted)' }}>
            {siteConfig.role} · based in {siteConfig.location}
          </p>
          <h1
            className="summary-reveal mt-4 max-w-[18ch] font-bold break-words"
            style={{ fontFamily: 'var(--font-summary-display), sans-serif', fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', lineHeight: 1.02, letterSpacing: '-0.03em', ...revealDelay(90) }}
          >
            Keeps production systems{' '}
            <span className="relative inline-block px-1">
              <HandDrawnCircle />
              online
            </span>
            .
          </h1>
          <p className="summary-reveal mt-6 max-w-[46ch] text-lg sm:text-xl" style={{ color: 'var(--summary-ink-muted)', lineHeight: 1.5, ...revealDelay(180) }}>
            {yearsExperience+1}+ years in production infrastructure... and automating the parts that shouldn&apos;t need a human.
          </p>
        </section>

        <hr style={{ borderColor: 'var(--summary-ink)', borderTopWidth: '2px' }} />

        {/* Supporting stats */}
        <section className="grid grid-cols-2 gap-3 py-10 sm:grid-cols-4 sm:gap-4 sm:py-14">
          {[
            { value: `${yearsExperience+1}+`, label: 'years experience' },
            { value: shippedProjects.length, label: 'shipped projects' },
            { value: contributionProjects.length, label: 'open-source contributions' },
            { value: certifications.length, label: 'certifications' },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className="summary-reveal rounded-2xl border px-4 py-6 text-center sm:px-6 sm:py-8"
              style={{ backgroundColor: 'var(--summary-paper-2)', borderColor: 'var(--summary-rule)', ...revealDelay(70, idx) }}
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
            {sortedExperience.map((exp, idx) => (
              <div
                key={exp.id}
                className={`summary-reveal ${cardClass}`}
                style={{ backgroundColor: 'var(--summary-paper-2)', borderColor: 'var(--summary-rule)', ...revealDelay(80, idx) }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-semibold" style={{ fontFamily: 'var(--font-summary-display), sans-serif' }}>{exp.role} · {exp.company}</p>
                  <p className="text-sm tabular-nums" style={{ color: 'var(--summary-ink-muted)' }}>{exp.startDate} – {exp.endDate === 'ongoing' ? 'present' : exp.endDate}</p>
                </div>
                <p className="mt-2 max-w-[65ch]" style={{ color: 'var(--summary-ink-muted)', lineHeight: 1.6 }}>
                  {exp.plainSummary || exp.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        {summaryEducation.length > 0 && (
          <section className="py-10 sm:py-14">
            <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--summary-ink-muted)' }}>Education</h2>
            <div className="mt-6 flex flex-col gap-4">
              {summaryEducation.map((edu, idx) => (
                <div
                  key={edu.id}
                  className={`summary-reveal ${cardClass}`}
                  style={{ backgroundColor: 'var(--summary-paper-2)', borderColor: 'var(--summary-rule)', ...revealDelay(80, idx) }}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="font-semibold" style={{ fontFamily: 'var(--font-summary-display), sans-serif' }}>{edu.degree}{edu.field && `, ${edu.field}`}</p>
                    <p className="text-sm tabular-nums" style={{ color: 'var(--summary-ink-muted)' }}>{edu.startDate} – {edu.endDate || 'present'}</p>
                  </div>
                  <p className="mt-2" style={{ color: 'var(--summary-ink-muted)', lineHeight: 1.6 }}>
                    {edu.institution}
                    {edu.grade && (
                      <>
                        {' · '}
                        <span className="relative inline-block px-0.5 font-medium" style={{ color: 'var(--summary-ink)' }}>
                          {edu.grade}
                          {idx === 0 && <HandDrawnUnderline />}
                        </span>
                      </>
                    )}
                  </p>
                  {edu.thesisUrl && (
                    <a href={edu.thesisUrl} className={`mt-3 inline-flex items-center gap-1 text-sm font-medium ${linkClass}`} style={{ color: 'var(--summary-accent)' }}>
                      View thesis →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Selected projects */}
        <section className="py-10 sm:py-14">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--summary-ink-muted)' }}>Selected projects</h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {publicProjects.map((project, idx) => (
              <div
                key={project.id}
                className={`group summary-reveal ${cardClass}`}
                style={{ backgroundColor: 'var(--summary-paper-2)', borderColor: 'var(--summary-rule)', ...revealDelay(80, idx) }}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-semibold" style={{ fontFamily: 'var(--font-summary-display), sans-serif' }}>
                    {project.name}
                    <span className="ml-2 align-middle text-xs font-normal" style={{ color: 'var(--summary-ink-muted)' }}>
                      {project.projectType === 'contribution' ? '· contribution' : '· personal'}
                    </span>
                  </p>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-medium group-hover:underline underline-offset-2 ${linkClass}`}
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
            className="summary-reveal rounded-3xl border px-6 py-12 text-center sm:px-16 sm:py-16"
            style={{ backgroundColor: 'var(--summary-paper-2)', borderColor: 'var(--summary-rule)' }}
          >
            <h2 className="font-bold" style={{ fontFamily: 'var(--font-summary-display), sans-serif', fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', letterSpacing: '-0.02em' }}>
              Let&apos;s talk.
            </h2>
            <p className="mx-auto mt-3 max-w-[40ch]" style={{ color: 'var(--summary-ink-muted)', lineHeight: 1.6 }}>
              No form, no funnel, just an email.
            </p>
            {email && (
              <a
                href={email.href}
                className={`mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold hover:-translate-y-0.5 hover:shadow-lg ${linkClass}`}
                style={{ backgroundColor: 'var(--summary-accent)', color: 'var(--summary-accent-ink)' }}
              >
                <ContactIcon name="mail" className="h-[18px] w-[18px]" />
                Email me →
              </a>
            )}
          </div>
        </section>

        {/* Elsewhere — every channel gets a real CTA, grey by default, coral on hover */}
        {socialChannels.length > 0 && (
          <section className="summary-reveal pb-14 sm:pb-20">
            <h2 className="text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--summary-ink-muted)' }}>Elsewhere</h2>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {socialChannels.map((item) => (
                <a
                  key={item.text}
                  href={item.href}
                  target={item.href!.startsWith('http') ? '_blank' : undefined}
                  rel={item.href!.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-[var(--summary-ink-muted)] border-[var(--summary-rule)] hover:scale-[1.04] hover:text-[var(--summary-accent)] hover:border-[var(--summary-accent)] ${linkClass}`}
                >
                  <ContactIcon name={channelIcon(item.href!)} className="h-[16px] w-[16px]" />
                  {item.text}
                </a>
              ))}
            </div>
          </section>
        )}
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
