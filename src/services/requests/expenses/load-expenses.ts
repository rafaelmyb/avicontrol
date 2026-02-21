export type ExpenseListOptions = {
  start: string;
  end: string;
  page: number;
  limit: number;
  orderBy: "date" | "amount";
  orderDirection: "asc" | "desc";
};

export type ExpenseListItemDto = {
  id: string;
  amount: number;
  description: string | null;
  category: string | null;
  date: string;
};

export const loadExpenses = async (options: ExpenseListOptions) => {
  const params = new URLSearchParams();
  params.set("start", options.start);
  params.set("end", options.end);
  params.set("page", String(options.page));
  params.set("limit", String(options.limit));
  params.set("orderBy", options.orderBy);
  params.set("orderDirection", options.orderDirection);

  const res = await fetch(`/api/expenses?${params.toString()}`);
  if (!res.ok) throw new Error("Failed");
  return res.json() as Promise<{
    list: ExpenseListItemDto[];
    total: number;
    page: number;
    limit: number;
  }>;
};
