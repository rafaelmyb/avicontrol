export type UpdateChickenBody = {
  name: string;
  breed: string;
  birthDate: string;
  status: string;
  source: string;
  purchasePrice?: number | null;
};

export const updateChicken = async (
  id: string,
  body: UpdateChickenBody
): Promise<unknown> => {
  const res = await fetch(`/api/chickens/${id}`, {
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
