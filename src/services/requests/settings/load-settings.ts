export type SettingsDto = {
  eggPricePerUnit: number | null;
};

export const loadSettings = async (): Promise<SettingsDto> => {
  const res = await fetch("/api/settings");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};
