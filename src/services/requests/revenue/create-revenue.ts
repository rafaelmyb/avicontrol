export type CreateRevenueBody = {
  amount: number;
  description?: string | null;
  source?: string | null;
  date: string;
};

export const createRevenue = async (
  body: CreateRevenueBody
): Promise<unknown> => {
  const res = await fetch("/api/revenue", {
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
