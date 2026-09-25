/* ============================================================
   Date helpers. Kept small and explicit. Every date parse is
   local-tz (never UTC) so a "2026-09-25" string never shifts
   into the previous day due to timezone drift.
============================================================ */

/** Philippine 2026 holidays per Proclamation No. 727 s.2025.
 *  Eid'l Fitr / Eid'l Adha excluded (announced separately). */
export const PH_HOLIDAYS_2026 = new Set<string>([
  '2026-01-01',
  '2026-04-02', '2026-04-03', '2026-04-04', '2026-04-09',
  '2026-05-01',
  '2026-06-12',
  '2026-08-21', '2026-08-31',
  '2026-11-01', '2026-11-30',
  '2026-12-08', '2026-12-24', '2026-12-25', '2026-12-30', '2026-12-31',
]);

/** Parse a YYYY-MM-DD string as a local-tz Date, or null if invalid. */
export function parseISO(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const m = iso.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!m) return null;
  const d = new Date(parseInt(m[1]), parseInt(m[2]) - 1, parseInt(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

/** Format a Date as YYYY-MM-DD (local-tz). */
export function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "Sep 25 2026" — the display format used everywhere in the app. */
export function fmtDate(iso: string | null | undefined): string {
  const d = parseISO(iso ?? null);
  if (!d) return '—';
  return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()} ${d.getFullYear()}`;
}

/** Short form "Sep 25" (no year) — for the Gantt today marker and tight cells. */
export function fmtDateShort(iso: string | null | undefined): string {
  const d = parseISO(iso ?? null);
  if (!d) return '—';
  return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getDate()}`;
}

/** Days between two ISO dates (inclusive). Negative if `to` < `from`. */
export function daysBetween(from: string, to: string): number {
  const a = parseISO(from);
  const b = parseISO(to);
  if (!a || !b) return 0;
  const ms = b.getTime() - a.getTime();
  return Math.round(ms / 86400000) + (ms >= 0 ? 1 : -1);
}

/** Working days (Mon-Fri excl. PH holidays) in the inclusive range. */
export function workingDaysBetween(from: string, to: string): number {
  const a = parseISO(from);
  const b = parseISO(to);
  if (!a || !b) return 0;
  if (b < a) return 0;
  let count = 0;
  const d = new Date(a);
  while (d <= b) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6 && !PH_HOLIDAYS_2026.has(toISO(d))) {
      count++;
    }
    d.setDate(d.getDate() + 1);
  }
  return count;
}

/** True if `iso` is strictly before today (local tz). Used for overdue detection. */
export function isPast(iso: string | null | undefined, todayIso: string): boolean {
  const d = parseISO(iso ?? null);
  const t = parseISO(todayIso);
  if (!d || !t) return false;
  return d < t;
}

/** Days from today to `iso`. Negative = overdue. */
export function daysFromToday(iso: string, todayIso: string): number {
  return daysBetween(todayIso, iso) - 1;
}
