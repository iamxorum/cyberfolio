export function formatDuration(rawSec: number): string {
  const totalSec = Math.round(rawSec);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(h > 0 ? 2 : 1, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatHours(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function formatPace(movingTimeSec: number, distanceKm: number): string {
  if (distanceKm <= 0) return '--';
  const secPerKm = Math.round(movingTimeSec / distanceKm);
  return `${Math.floor(secPerKm / 60)}:${String(secPerKm % 60).padStart(2, '0')}/km`;
}

export function formatKm(km: number, digits = 1): string {
  return km.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Built by hand: Intl month names differ between Node's ICU and browsers ("Sept" vs "Sep"), breaking hydration.
export function formatDay(isoDay: string): string {
  const [, month, day] = isoDay.split('-');
  return `${day} ${MONTHS[Number(month) - 1]}`;
}
