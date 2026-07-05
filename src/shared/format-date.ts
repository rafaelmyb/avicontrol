/**
 * Format an ISO date string (with or without time) as pt-BR date only,
 * without timezone shift (uses the date part as local date).
 */
export function formatDateOnly(isoString: string): string {
  const part = isoString.slice(0, 10);
  const [y, m, d] = part.split("-").map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return isoString;
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR");
}

/**
 * Returns today's date in the local timezone as "YYYY-MM-DD".
 * Use this instead of `new Date().toISOString().slice(0, 10)` for form
 * default values — the ISO string uses UTC and may return tomorrow's date
 * for users in UTC− timezones (e.g. Brazil, UTC-3) after 21:00 local time.
 */
export function todayLocalISODate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
