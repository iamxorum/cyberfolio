/** "2026-10-22" -> "Oct 22, 2026". UTC, so a date-only string never slips a day with the viewer's timezone; unparsable input is returned as is. */
export function formatDate(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
