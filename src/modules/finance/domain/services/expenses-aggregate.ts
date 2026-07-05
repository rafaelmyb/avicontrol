/**
 * Pure domain helpers for expense aggregation by month.
 */

export interface MonthIdentifier {
  year: number;
  month: number;
}

export interface MonthlyExpensesTotal extends MonthIdentifier {
  total: number;
}

/**
 * Generates an ordered list of month identifiers for the last N months
 * (including the reference month), oldest first.
 */
export function buildMonthRange(
  referenceDate: Date,
  months: number
): MonthIdentifier[] {
  const result: MonthIdentifier[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(
        referenceDate.getUTCFullYear(),
        referenceDate.getUTCMonth() - i,
        1
      )
    );
    result.push({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 });
  }
  return result;
}

/**
 * Merges raw DB rows with a full month range, setting total = 0 for months
 * that have no matching row.
 */
export function fillMissingMonths(
  raw: MonthlyExpensesTotal[],
  range: MonthIdentifier[]
): MonthlyExpensesTotal[] {
  const map = new Map<string, number>();
  for (const r of raw) {
    map.set(`${r.year}-${r.month}`, r.total);
  }
  return range.map(({ year, month }) => ({
    year,
    month,
    total: map.get(`${year}-${month}`) ?? 0,
  }));
}
