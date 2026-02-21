export const deleteFeed = async (id: string): Promise<void> => {
  const res = await fetch(`/api/feed/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed");
};
