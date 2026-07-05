import type { IExpenseRepository, MonthlyExpensesRow } from "../domain/repository";
import {
  buildMonthRange,
  fillMissingMonths,
} from "../domain/services/expenses-aggregate";

export interface ExpensesHistoryResult {
  totalAllTime: number;
  byMonth: MonthlyExpensesRow[];
}

/**
 * Returns the all-time total of expenses and the per-month breakdown for the
 * last `months` months (defaults to 12), with zero-filled gaps.
 */
export async function getExpensesHistory(
  repo: IExpenseRepository,
  userId: string,
  referenceDate: Date,
  months = 12
): Promise<ExpensesHistoryResult> {
  const [totalAllTime, rawByMonth] = await Promise.all([
    repo.sumAllByUserId(userId),
    repo.sumByUserIdGroupedByMonth(userId, referenceDate, months),
  ]);

  const range = buildMonthRange(referenceDate, months);
  const byMonth = fillMissingMonths(rawByMonth, range);

  return { totalAllTime, byMonth };
}
