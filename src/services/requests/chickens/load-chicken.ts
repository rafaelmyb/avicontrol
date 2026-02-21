export type ChickenByIdDto = {
  id: string;
  userId: string;
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

export const loadChicken = async (id: string): Promise<ChickenByIdDto> => {
  const res = await fetch(`/api/chickens/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
};
