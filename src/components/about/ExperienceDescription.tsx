'use client';

import { useState } from 'react';
import { parseDescription } from '@/lib/cv-helpers';
import { usePrefersReducedMotion } from '@/lib/motion';

const COLLAPSED_COUNT = 3;
const LIST_CLASS = 'text-xs text-[var(--terminal-text-muted)] list-disc pl-4 space-y-0.5';

export default function ExperienceDescription({ description }: { description?: string }) {
  const [expanded, setExpanded] = useState(false);
  const reduced = usePrefersReducedMotion();
  const points = parseDescription(description);

  if (points.length === 0) return null;

  const head = points.slice(0, COLLAPSED_COUNT);
  const tail = points.slice(COLLAPSED_COUNT);

  return (
    <div className="mb-1">
      <ul className={LIST_CLASS}>
        {head.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      {tail.length > 0 && (
        <>
          <div
            className="grid"
            style={{
              gridTemplateRows: expanded ? '1fr' : '0fr',
              opacity: expanded ? 1 : 0,
              transition: reduced
                ? 'none'
                : 'grid-template-rows 280ms cubic-bezier(0.23, 1, 0.32, 1), opacity 200ms ease-out',
            }}
            aria-hidden={!expanded}
          >
            <div className="overflow-hidden">
              <ul className={`${LIST_CLASS} pt-0.5`} inert={!expanded}>
                {tail.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setExpanded(e => !e)}
            aria-expanded={expanded}
            className="mt-1 text-[10px] font-mono tracking-wider text-primary hover:underline"
          >
            {expanded ? '[- show less]' : `[+ ${tail.length} more]`}
          </button>
        </>
      )}
    </div>
  );
}
