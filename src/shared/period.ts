/**
 * Period presets for the dashboard filter.
 * Dates are built with local-time constructors (matching how Expense/Revenue dates are stored).
 */
export const PERIOD_PRESETS = [
  "current_month",
  "last_30_days",
  "current_year",
] as const;

export type PeriodPreset = (typeof PERIOD_PRESETS)[number];

export interface DateRange {
  from: Date;
  to: Date;
}

/**
 * Returns a local-time [from, to] date range for a given period preset.
 * `to` is set to end-of-day (23:59:59.999) so that inclusive queries capture
 * all records created during the last day of the period.
 */
export function getDateRangeFromPreset(preset: PeriodPreset, now: Date): DateRange {
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed
  const d = now.getDate();

  switch (preset) {
    case "current_month":
      return {
        from: new Date(y, m, 1, 0, 0, 0, 0),
        to: new Date(y, m + 1, 0, 23, 59, 59, 999), // last day of month
      };
    case "last_30_days":
      // d - 29 rolls back correctly via JS Date even across month boundaries.
      // Example: today = Jul 5 → from = Jun 6 (30 days inclusive: Jun 6 … Jul 5).
      return {
        from: new Date(y, m, d - 29, 0, 0, 0, 0),
        to: new Date(y, m, d, 23, 59, 59, 999),
      };
    case "current_year":
      return {
        from: new Date(y, 0, 1, 0, 0, 0, 0),
        to: new Date(y, 11, 31, 23, 59, 59, 999),
      };
  }
}

/**
 * Proportional egg production estimate for an arbitrary date range.
 *
 * Decision: the constant DEFAULT_AVERAGE_EGGS_PER_MONTH (20) represents a
 * "standard 30-day month". We scale linearly by the number of calendar days in
 * the selected period, using 30 as the denominator for consistency with that
 * constant. 30.44 (average Gregorian month) was deliberately avoided to keep
 * the result intuitive: selecting "Últimos 30 dias" always yields exactly
 * `layingCount × averagePerMonth`, matching the baseline monthly value.
 *
 * The day count is derived by rounding (to - from) / 1 day, which correctly
 * handles from=start-of-day / to=end-of-day pairs without an extra +1.
 *
 * Examples:
 *   - 31-day month  → factor = 31/30 ≈ 1.033 → ~20.67 eggs/hen
 *   - 30 days       → factor = 30/30 = 1      → exactly 20 eggs/hen
 *   - 365-day year  → factor = 365/30 ≈ 12.17 → ~243 eggs/hen
 */
export function scaledEggProduction(
  layingChickensCount: number,
  averageEggsPerMonth: number,
  from: Date,
  to: Date
): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const days = Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
  return layingChickensCount * averageEggsPerMonth * (days / 30);
}
