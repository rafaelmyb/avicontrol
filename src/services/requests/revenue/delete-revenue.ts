export const deleteRevenue = async (id: string): Promise<void> => {
  const res = await fetch(`/api/revenue/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed");
  }
};
