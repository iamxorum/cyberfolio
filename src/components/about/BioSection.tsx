import { contentConfig } from '@/config';

function BioPromptLine() {
  const title = contentConfig.about.bio.title;
  const promptMatch = title.match(/^(.+?)(\s+)(.+)$/);

  if (promptMatch) {
    const [, prompt, space, command] = promptMatch;
    return (
      <>
        <span className="text-primary">{prompt}</span>
        <span>{space}{command}</span>
      </>
    );
  }

  return <span className="text-primary">{title}</span>;
}

export default function BioSection() {
  const title = contentConfig.about.bio.title;
  const titleMatch = title.match(/cat\s+(.+)/);
  const terminalLabel = titleMatch ? titleMatch[1] : '/var/log/user_bio.txt';

  return (
    <div id="bio" className="bg-[var(--terminal-bg)] border border-[var(--terminal-border)] rounded relative overflow-hidden scroll-mt-20">
      <div className="bg-[var(--terminal-surface-alt)] px-3 sm:px-4 py-2 border-b border-[var(--terminal-border)] flex justify-between items-center">
        <span className="text-[10px] sm:text-xs font-mono text-[var(--terminal-text-dim)]">
          {terminalLabel}
        </span>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--terminal-border)]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--terminal-border)]"></div>
        </div>
      </div>
      <div className="p-4 sm:p-6 font-mono text-xs sm:text-sm leading-relaxed text-[var(--terminal-text-light)]">
        <p className="animate-reveal mb-3 sm:mb-4">
          <BioPromptLine />
        </p>
        {contentConfig.about.bio.paragraphs.map((paragraph, index) => (
          <p key={index} className="animate-reveal mb-3 sm:mb-4" style={{ animationDelay: `${150 + Math.min(index, 6) * 130}ms` }}>
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
