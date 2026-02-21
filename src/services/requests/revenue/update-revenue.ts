export type UpdateRevenueBody = {
  amount?: number;
  description?: string | null;
  source?: string | null;
  date?: string;
};

export const updateRevenue = async (
  id: string,
  body: UpdateRevenueBody
): Promise<unknown> => {
  const res = await fetch(`/api/revenue/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed");
  }
  return res.json();
};
