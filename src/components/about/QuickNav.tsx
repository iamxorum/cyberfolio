const SECTIONS = [
  { href: '#bio', label: 'BIO' },
  { href: '#experience', label: 'EXPERIENCE' },
  { href: '#skills', label: 'SKILLS' },
  { href: '#education', label: 'EDUCATION' },
  { href: '#certifications', label: 'CERTS' },
  { href: '#hobbies', label: 'HOBBIES' },
];

export default function QuickNav() {
  return (
    <nav aria-label="Section jump links" className="flex flex-wrap gap-2 text-[10px] sm:text-xs font-mono">
      {SECTIONS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="px-2 py-1 rounded border border-[var(--terminal-border)] text-[var(--terminal-text-muted)] hover:border-primary hover:text-primary active:scale-95 transition-all"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
