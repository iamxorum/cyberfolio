import { Inter, Inter_Tight } from 'next/font/google';
import Link from 'next/link';
import { siteConfig, experience, projects, certifications, cvConfig } from '@/config';
import { getContactInfo } from '@/lib/cv-helpers';
import Header from './Header';
import Footer from './Footer';

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

export default function SummaryView() {
  const yearsExperience = getYearsExperience();
  const publicProjects = projects.filter((p) => p.visibility === 'public');
  const companiesCount = new Set(experience.map((e) => e.company)).size;
  const contactInfo = getContactInfo(siteConfig, cvConfig.email);

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
      <Header />

      <main id="main-content" className="mx-auto max-w-[880px] px-6 sm:px-8">
        {/* Hero — Stat-Led */}
        <section className="pt-16 sm:pt-24 pb-12 sm:pb-16">
          <p className="text-sm font-medium tracking-wide" style={{ color: 'var(--summary-ink-muted)' }}>
            {siteConfig.fullName} · {siteConfig.role}
          </p>
          <div
            className="mt-4 font-bold"
            style={{ fontFamily: 'var(--font-summary-display), sans-serif', fontSize: 'clamp(4rem, 12vw, 7rem)', lineHeight: 1.02, letterSpacing: '-0.03em' }}
          >
            {yearsExperience}<span style={{ color: 'var(--summary-accent)' }}>+</span>
          </div>
          <p className="mt-3 max-w-[46ch] text-lg sm:text-xl" style={{ lineHeight: 1.4 }}>
            years in production infrastructure — keeping systems online, and automating the parts that shouldn&apos;t need a human.
          </p>
          <a
            href="#contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--summary-accent)]"
            style={{ borderColor: 'var(--summary-accent)', color: 'var(--summary-accent)' }}
          >
            Get in touch →
          </a>
        </section>

        {/* Supporting stats */}
        <section className="grid grid-cols-3 border-y py-8" style={{ borderColor: 'var(--summary-rule)' }}>
          {[
            { value: publicProjects.length, label: 'shipped projects' },
            { value: certifications.length, label: 'certifications' },
            { value: companiesCount, label: 'companies' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-bold tabular-nums" style={{ fontFamily: 'var(--font-summary-display), sans-serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', letterSpacing: '-0.02em' }}>
                {stat.value}
              </div>
              <div className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--summary-ink-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Experience highlights */}
        <section className="py-12 sm:py-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--summary-ink-muted)' }}>Experience</h2>
          <div className="mt-6 flex flex-col gap-6">
            {experience.map((exp) => (
              <div key={exp.id} className="border-t pt-6" style={{ borderColor: 'var(--summary-rule)' }}>
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
        <section className="py-12 sm:py-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--summary-ink-muted)' }}>Selected projects</h2>
          <div className="mt-6 flex flex-col gap-6">
            {publicProjects.map((project) => (
              <div key={project.id} className="border-t pt-6" style={{ borderColor: 'var(--summary-rule)' }}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <p className="font-semibold" style={{ fontFamily: 'var(--font-summary-display), sans-serif' }}>{project.name}</p>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--summary-accent)]"
                      style={{ color: 'var(--summary-accent)' }}
                    >
                      View →
                    </a>
                  )}
                </div>
                <p className="mt-2 max-w-[65ch]" style={{ color: 'var(--summary-ink-muted)', lineHeight: 1.6 }}>{project.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-12 sm:py-16 scroll-mt-20">
          <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--summary-ink-muted)' }}>Get in touch</h2>
          <p className="mt-4 max-w-[50ch]" style={{ lineHeight: 1.6 }}>
            No form, no funnel — just reach out directly.
          </p>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            {[...contactInfo.personal, ...contactInfo.links].map((item) => (
              item.href ? (
                <a
                  key={item.text}
                  href={item.href}
                  target={item.href.startsWith('http') ? '_blank' : undefined}
                  rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="text-sm font-semibold underline decoration-2 underline-offset-4 transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--summary-accent)]"
                  style={{ color: 'var(--summary-accent)' }}
                >
                  {item.text}
                </a>
              ) : (
                <span key={item.text} className="text-sm" style={{ color: 'var(--summary-ink-muted)' }}>{item.text}</span>
              )
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-4 text-sm">
            <Link href="/cv" prefetch={false} className="font-medium underline underline-offset-4 transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--summary-accent)]" style={{ color: 'var(--summary-ink)' }}>
              Download the full résumé (PDF) →
            </Link>
            <Link href="/" className="font-medium underline underline-offset-4 transition-transform active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--summary-accent)]" style={{ color: 'var(--summary-ink-muted)' }}>
              See the full interactive site →
            </Link>
          </div>
        </section>
      </main>

      <div className="mx-auto max-w-[880px] px-6 sm:px-8">
        <Footer />
      </div>
    </div>
  );
}
