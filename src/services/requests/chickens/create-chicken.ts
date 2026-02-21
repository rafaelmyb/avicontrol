export type CreateChickenBody = {
  batch?: boolean;
  batchName?: string;
  quantity?: number;
  name?: string;
  breed: string;
  birthDate: string;
  status: string;
  source: string;
  purchasePrice?: number | null;
};

export const createChicken = async (
  body: CreateChickenBody
): Promise<unknown> => {
  const url = body.batch ? "/api/chickens/batch" : "/api/chickens";
  const payload = body.batch
    ? {
        batchName: body.batchName,
        quantity: body.quantity,
        breed: body.breed,
        birthDate: body.birthDate,
        status: body.status,
        source: body.source,
        purchasePrice: body.purchasePrice ?? null,
      }
    : {
        name: body.name,
        breed: body.breed,
        birthDate: body.birthDate,
        status: body.status,
        source: body.source,
        purchasePrice: body.purchasePrice ?? null,
      };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Failed");
  }
  return res.json();
};
