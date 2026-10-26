// Small controls (min left, back to top) ease in and out: a fade plus a short rise, never a pop.
// Same curve both ways, but leaving is quicker than arriving so a control never lingers after you scroll away.
// Reduced motion keeps the fade only.
export const REVEAL = 'transition-[opacity,translate,scale,color,border-color] ease-[cubic-bezier(0.45,0,0.25,1)] motion-reduce:transition-opacity';
export const SHOWN = 'pointer-events-auto translate-y-0 opacity-100 duration-[350ms]';
export const HIDDEN = 'pointer-events-none translate-y-2 opacity-0 duration-[160ms] motion-reduce:translate-y-0';
