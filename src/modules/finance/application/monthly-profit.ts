import type { IExpenseRepository } from "../domain/repository";
import type { IRevenueRepository } from "../domain/repository";
import { monthlyProfit } from "../domain/services/profit";

export interface MonthlyProfitResult {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
}

export async function getMonthlyProfit(
  expenseRepo: IExpenseRepository,
  revenueRepo: IRevenueRepository,
  userId: string,
  year: number,
  month: number
): Promise<MonthlyProfitResult> {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  const [totalRevenue, totalExpenses] = await Promise.all([
    revenueRepo.sumByUserIdAndDateRange(userId, start, end),
    expenseRepo.sumByUserIdAndDateRange(userId, start, end),
  ]);
  const profit = monthlyProfit(totalRevenue, totalExpenses);
  return { totalRevenue, totalExpenses, profit };
}
