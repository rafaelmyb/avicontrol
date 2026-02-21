import { prisma } from "@/lib/prisma";
import type { MonthlyProfitResult } from "./monthly-profit";
import { monthlyProfit } from "../domain/services/profit";

export interface MonthlyProfitBatchResult {
  byMonth: MonthlyProfitResult[];
  currentMonth: MonthlyProfitResult;
}

/**
 * Returns revenue and expense sums per month for the last 12 months in two raw queries.
 * Replaces 13× getMonthlyProfit (26 round-trips) with 2 queries.
 */
export async function getMonthlyProfitBatch(
  userId: string,
  referenceDate: Date
): Promise<MonthlyProfitBatchResult> {
  const startOfRange = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 11, 1, 0, 0, 0, 0);

  type Row = { month: Date; sum: number };
  const [revenueRows, expenseRows] = await Promise.all([
    prisma.$queryRaw<Row[]>`
      SELECT date_trunc('month', date)::date AS month, COALESCE(SUM(amount), 0) AS sum
      FROM "Revenue"
      WHERE "userId" = ${userId} AND date >= ${startOfRange}
      GROUP BY date_trunc('month', date)
    `,
    prisma.$queryRaw<Row[]>`
      SELECT date_trunc('month', date)::date AS month, COALESCE(SUM(amount), 0) AS sum
      FROM "Expense"
      WHERE "userId" = ${userId} AND date >= ${startOfRange}
      GROUP BY date_trunc('month', date)
    `,
  ]);

  const revenueByKey = new Map<string, number>();
  for (const r of revenueRows) {
    const d = r.month instanceof Date ? r.month : new Date(r.month);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    revenueByKey.set(key, Number(r.sum));
  }
  const expenseByKey = new Map<string, number>();
  for (const e of expenseRows) {
    const d = e.month instanceof Date ? e.month : new Date(e.month);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    expenseByKey.set(key, Number(e.sum));
  }

  const byMonth: MonthlyProfitResult[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${month}`;
    const totalRevenue = revenueByKey.get(key) ?? 0;
    const totalExpenses = expenseByKey.get(key) ?? 0;
    byMonth.push({
      totalRevenue,
      totalExpenses,
      profit: monthlyProfit(totalRevenue, totalExpenses),
    });
  }

  const currentYear = referenceDate.getFullYear();
  const currentMonth = referenceDate.getMonth() + 1;
  const currentKey = `${currentYear}-${currentMonth}`;
  const currentRevenue = revenueByKey.get(currentKey) ?? 0;
  const currentExpenses = expenseByKey.get(currentKey) ?? 0;
  const currentMonthResult: MonthlyProfitResult = {
    totalRevenue: currentRevenue,
    totalExpenses: currentExpenses,
    profit: monthlyProfit(currentRevenue, currentExpenses),
  };

  return { byMonth, currentMonth: currentMonthResult };
}
