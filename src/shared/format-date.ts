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
