export type ExpenseDto = {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  category: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
};

export const loadExpense = async (id: string): Promise<ExpenseDto> => {
  const res = await fetch(`/api/expenses/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
};
