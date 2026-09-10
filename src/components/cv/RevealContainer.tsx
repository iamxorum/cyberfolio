import type { ReactNode } from 'react';

interface RevealContainerProps {
  visible: boolean;
  children: ReactNode;
}

export default function RevealContainer({ visible, children }: RevealContainerProps) {
  return (
    <div
      className="cv-container overflow-hidden print:p-0 print:overflow-visible print:opacity-100! print:max-h-none!"
      style={{
        opacity: visible ? 1 : 0,
        maxHeight: visible ? '20000px' : '0px',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 300ms ease-out, max-height 300ms ease-out',
      }}
      aria-hidden={!visible}
    >
      {children}
    </div>
  );
}
