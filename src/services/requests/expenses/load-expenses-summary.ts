export type ExpensesSummaryMonthDto = {
  year: number;
  month: number;
  total: number;
};

export type ExpensesSummaryDto = {
  totalAllTime: number;
  byMonth: ExpensesSummaryMonthDto[];
};

export const loadExpensesSummary = async (): Promise<ExpensesSummaryDto> => {
  const res = await fetch("/api/expenses/summary");
  if (!res.ok) throw new Error("Failed to load expenses summary");
  return res.json() as Promise<ExpensesSummaryDto>;
};
