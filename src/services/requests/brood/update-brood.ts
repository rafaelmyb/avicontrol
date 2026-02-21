export type UpdateBroodBody = {
  actualHatchedCount?: number;
  status?: string;
};

export const updateBrood = async (
  id: string,
  body: UpdateBroodBody
): Promise<unknown> => {
  const res = await fetch(`/api/brood/${id}`, {
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
