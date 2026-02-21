export type BroodListOptions = {
  page: number;
  limit: number;
  orderBy: "expectedHatchDate" | "startDate" | "createdAt";
  orderDirection: "asc" | "desc";
};

export type BroodCycleDto = {
  id: string;
  chickenId: string;
  chicken?: { name: string };
  startDate: string;
  eggCount: number;
  expectedHatchDate: string;
  expectedReturnToLayDate: string;
  actualHatchedCount: number | null;
  status: string;
};

export const loadBroodList = async (options: BroodListOptions) => {
  const params = new URLSearchParams();
  params.set("page", String(options.page));
  params.set("limit", String(options.limit));
  params.set("orderBy", options.orderBy);
  params.set("orderDirection", options.orderDirection);

  const res = await fetch(`/api/brood?${params.toString()}`);
  if (!res.ok) throw new Error("Failed");
  return res.json() as Promise<{
    list: BroodCycleDto[];
    total: number;
    page: number;
    limit: number;
  }>;
};
