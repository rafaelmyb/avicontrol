export type CreateExpenseBody = {
  amount: number;
  description?: string | null;
  category?: string | null;
  date: string;
};

export const createExpense = async (
  body: CreateExpenseBody
): Promise<unknown> => {
  const res = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed");
  }
  return res.json();
};
