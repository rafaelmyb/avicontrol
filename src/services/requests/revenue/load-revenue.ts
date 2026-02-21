export type RevenueDto = {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  source: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export const loadRevenue = async (id: string): Promise<RevenueDto> => {
  const res = await fetch(`/api/revenue/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
};
