export type ChickenListOptions = {
  page: number;
  limit: number;
  status: string | null;
  batchName: string | null;
  orderBy: "createdAt" | "name" | "birthDate";
  orderDirection: "asc" | "desc";
};

export type ChickenDto = {
  id: string;
  name: string;
  batchName: string | null;
  breed: string;
  birthDate: string;
  status: string;
  source: string;
  purchasePrice: number | null;
  ageInDays: number;
  layStartDate: string;
  createdAt: string;
  updatedAt: string;
};

export const loadChickens = async (options: ChickenListOptions) => {
  const params = new URLSearchParams();
  params.set("page", String(options.page));
  params.set("limit", String(options.limit));
  params.set("orderBy", options.orderBy);
  params.set("orderDirection", options.orderDirection);
  if (options.status) params.set("status", options.status);
  if (options.batchName) params.set("batchName", options.batchName);

  const res = await fetch(`/api/chickens?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json() as Promise<{
    chickens: ChickenDto[];
    total: number;
    page: number;
    limit: number;
  }>;
};
