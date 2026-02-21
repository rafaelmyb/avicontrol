export const loadChickenBatchNames = async (): Promise<{
  batchNames: string[];
}> => {
  const res = await fetch("/api/chickens/batch-names");
  if (!res.ok) throw new Error("Failed");
  return res.json();
};
