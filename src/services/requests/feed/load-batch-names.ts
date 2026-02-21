export const loadFeedBatchNames = async (): Promise<{ batchNames: string[] }> => {
  const res = await fetch("/api/feed/batch-names");
  if (!res.ok) throw new Error("Failed");
  return res.json();
};
