/**
 * Pure domain: monthly profit = totalRevenue - totalExpenses.
 */
export function monthlyProfit(totalRevenue: number, totalExpenses: number): number {
  return totalRevenue - totalExpenses;
}

/**
 * Pure domain: annual projection from average monthly profit.
 */
export function annualProjectionFromMonthlyProfit(averageMonthlyProfit: number): number {
  return averageMonthlyProfit * 12;
}
