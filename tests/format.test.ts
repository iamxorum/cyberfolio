import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatDate } from '../src/lib/format-date.ts';
import { formatRelativeTime, isStale } from '../src/lib/format-time.ts';
import { formatDay, formatDuration, formatHours, formatKm, formatPace } from '../src/lib/running-format.ts';
import { sectionTime } from '../src/lib/section-time.ts';

const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

test('formatRelativeTime picks the largest unit', () => {
  assert.equal(formatRelativeTime(ago(10_000)), 'just now');
  assert.equal(formatRelativeTime(ago(5 * 60_000)), '5m ago');
  assert.equal(formatRelativeTime(ago(3 * 3_600_000)), '3h ago');
  assert.equal(formatRelativeTime(ago(2 * 86_400_000)), '2d ago');
  assert.equal(formatRelativeTime('not a date'), 'unknown');
});

test('isStale compares against the limit and ignores bad input', () => {
  assert.equal(isStale(ago(47 * 3_600_000)), false);
  assert.equal(isStale(ago(49 * 3_600_000)), true);
  assert.equal(isStale(ago(2 * 3_600_000), 1), true);
  assert.equal(isStale('garbage'), false);
});

test('formatDate is timezone independent and keeps unparsable input', () => {
  assert.equal(formatDate('2026-10-22'), 'Oct 22, 2026');
  assert.equal(formatDate('soon'), 'soon');
});

test('running formats', () => {
  assert.equal(formatDuration(59), '0:59');
  assert.equal(formatDuration(3725), '1:02:05');
  assert.equal(formatHours(5400), '1h 30m');
  assert.equal(formatHours(600), '10m');
  assert.equal(formatPace(1800, 5), '6:00/km');
  assert.equal(formatPace(1800, 0), '--');
  assert.equal(formatKm(1234.56), '1,234.6');
  assert.equal(formatDay('2026-09-05'), '05 Sep');
});

test('sectionTime rounds to minutes with a floor label', () => {
  assert.equal(sectionTime(50), '<1 min');
  assert.equal(sectionTime(200), '1 min');
  assert.equal(sectionTime(900), '5 min');
});
