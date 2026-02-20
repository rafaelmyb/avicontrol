import type { IExpenseRepository } from "../domain/repository";
import type { IRevenueRepository } from "../domain/repository";
import { monthlyProfit, annualProjectionFromMonthlyProfit } from "../domain/services/profit";

/**
 * Compute average monthly profit from current year so far, then project annual.
 */
export async function getAnnualProjection(
  expenseRepo: IExpenseRepository,
  revenueRepo: IRevenueRepository,
  userId: string
): Promise<{ averageMonthlyProfit: number; annualProjection: number }> {
  const now = new Date();
  const year = now.getFullYear();
  const monthsElapsed = now.getMonth() + 1;
  if (monthsElapsed === 0) {
    return { averageMonthlyProfit: 0, annualProjection: 0 };
  }
  let totalProfit = 0;
  for (let m = 1; m <= monthsElapsed; m++) {
    const start = new Date(year, m - 1, 1);
    const end = new Date(year, m, 0, 23, 59, 59, 999);
    const [rev, exp] = await Promise.all([
      revenueRepo.sumByUserIdAndDateRange(userId, start, end),
      expenseRepo.sumByUserIdAndDateRange(userId, start, end),
    ]);
    totalProfit += monthlyProfit(rev, exp);
  }
  const averageMonthlyProfit = totalProfit / monthsElapsed;
  const annualProjection = annualProjectionFromMonthlyProfit(averageMonthlyProfit);
  return { averageMonthlyProfit, annualProjection };
}
