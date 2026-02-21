export type FeedByIdDto = {
  id: string;
  name: string;
  batchName: string | null;
  feedType: string;
  weightKg: number;
  price: number | null;
  consumptionPerBirdGrams: number;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
};

export const loadFeedById = async (id: string): Promise<FeedByIdDto> => {
  const res = await fetch(`/api/feed/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
};
