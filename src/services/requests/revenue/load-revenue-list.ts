export type RevenueListOptions = {
  start: string;
  end: string;
  page: number;
  limit: number;
  orderBy: "date" | "amount";
  orderDirection: "asc" | "desc";
};

export type RevenueListItemDto = {
  id: string;
  amount: number;
  description: string | null;
  source: string | null;
  date: string;
};

export const loadRevenueList = async (options: RevenueListOptions) => {
  const params = new URLSearchParams();
  params.set("start", options.start);
  params.set("end", options.end);
  params.set("page", String(options.page));
  params.set("limit", String(options.limit));
  params.set("orderBy", options.orderBy);
  params.set("orderDirection", options.orderDirection);

  const res = await fetch(`/api/revenue?${params.toString()}`);
  if (!res.ok) throw new Error("Failed");
  return res.json() as Promise<{
    list: RevenueListItemDto[];
    total: number;
    page: number;
    limit: number;
  }>;
};
