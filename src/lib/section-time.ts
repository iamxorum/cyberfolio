// Keep in step with WORDS_PER_MINUTE in blog.ts (that module reads files, so a client component can't import it).
const WORDS_PER_MINUTE = 200;

/** "<1 min", "2 min": how long a section of `words` words takes to read. */
export function sectionTime(words: number): string {
  const minutes = Math.round(words / WORDS_PER_MINUTE);
  return minutes < 1 ? '<1 min' : `${minutes} min`;
}
