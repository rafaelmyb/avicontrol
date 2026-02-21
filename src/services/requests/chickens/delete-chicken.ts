export const deleteChicken = async (id: string): Promise<void> => {
  const res = await fetch(`/api/chickens/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed");
};
