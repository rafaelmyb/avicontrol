export type BroodByIdDto = {
  id: string;
  chickenId: string;
  chicken?: { id: string; name: string };
  startDate: string;
  eggCount: number;
  expectedHatchDate: string;
  expectedReturnToLayDate: string;
  actualHatchedCount: number | null;
  status: string;
};

export const loadBrood = async (id: string): Promise<BroodByIdDto> => {
  const res = await fetch(`/api/brood/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
};
