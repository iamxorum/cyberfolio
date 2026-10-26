const START = 0.3;

/**
 * Where the "current section" line sits, as a share of the screen height from the top, given how far
 * through the post you are (0 to 1). Mid-post it stays where the eye is, about a third of the way down.
 * Near the end it sweeps to the bottom edge, so the last sections, which can never scroll up that far,
 * become current while they are the ones on screen.
 */
export const readingLine = (progress: number) => START + (1 - START) * Math.min(1, Math.max(0, progress)) ** 3;
