import type { ReactNode } from 'react';

interface UltrawideDetailProps {
  /** What the list holds, e.g. "PROJECT"; shown while nothing is selected. */
  label: string;
  children?: ReactNode;
}

// Right-hand panel of a list + detail rail (ultrawide only). Entrance animations are switched off
// inside `.uw-detail` so swapping the selection does not replay them.
export default function UltrawideDetail({ label, children }: UltrawideDetailProps) {
  return (
    <aside className="uw-panel uw-panel-detail uw-detail" aria-live="polite" aria-label={`${label.toLowerCase()} details`}>
      {children ?? (
        <div className="flex h-full min-h-60 items-center justify-center rounded border border-dashed border-[var(--terminal-border)] p-6 text-center font-mono text-sm text-[var(--terminal-text-dim)]">
          {`// SELECT_A_${label}_TO_OPEN_IT_HERE`}
        </div>
      )}
    </aside>
  );
}
