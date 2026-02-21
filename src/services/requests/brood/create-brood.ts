export type CreateBroodBody = {
  chickenId: string;
  startDate: string;
  eggCount: number;
};

export const createBrood = async (
  body: CreateBroodBody
): Promise<unknown> => {
  const res = await fetch("/api/brood", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed");
  }
  return res.json();
};
