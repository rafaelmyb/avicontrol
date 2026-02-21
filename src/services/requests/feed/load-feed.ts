export type FeedListOptions = {
  feedTypeFilter: string | null;
  batchFilter: string | null;
  orderBy: string;
  orderDirection: string;
  page: number;
  limit: number;
};

export type FeedDto = {
  id: string;
  name: string;
  batchName: string | null;
  feedType: string;
  weightKg: number;
  price: number | null;
  consumptionPerBirdGrams: number;
  purchaseDate: string;
};

export const loadFeed = async (options: FeedListOptions) => {
  const params = new URLSearchParams();
  params.set("page", String(options.page));
  params.set("limit", String(options.limit));
  params.set("orderBy", options.orderBy);
  params.set("orderDirection", options.orderDirection);

  if (options.feedTypeFilter) params.set("feedType", options.feedTypeFilter);
  if (options.batchFilter) params.set("batchName", options.batchFilter);

  const res = await fetch(`/api/feed?${params.toString()}`);
  if (!res.ok) throw new Error("Failed");
  return res.json() as Promise<{
    list: FeedDto[];
    total: number;
    page: number;
    limit: number;
  }>;
};
