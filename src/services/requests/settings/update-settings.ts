export type UpdateSettingsBody = {
  eggPricePerUnit?: number | null;
};

export const updateSettings = async (
  body: UpdateSettingsBody
): Promise<{ eggPricePerUnit: number | null }> => {
  const res = await fetch("/api/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
};
