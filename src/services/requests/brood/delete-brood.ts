export const deleteBrood = async (id: string): Promise<void> => {
  const res = await fetch(`/api/brood/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed");
  }
};
