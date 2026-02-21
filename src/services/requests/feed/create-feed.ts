export type CreateFeedBody = {
  batch?: boolean;
  batchName?: string;
  quantity?: number;
  name?: string;
  feedType: string;
  weightKg: number;
  price: number | null;
  consumptionPerBirdGrams: number;
  purchaseDate: string;
};

export const createFeed = async (body: CreateFeedBody) => {
  const url = body.batch ? "/api/feed/batch" : "/api/feed";
  const uniqueBody = {
    name: body.name,
    feedType: body.feedType,
    weightKg: body.weightKg,
    price: body.price,
    consumptionPerBirdGrams: body.consumptionPerBirdGrams,
    purchaseDate: body.purchaseDate,
  };

  const batchBody = {
    batchName: body.batchName,
    quantity: body.quantity,
    feedType: body.feedType,
    weightKg: body.weightKg,
    price: body.price,
    consumptionPerBirdGrams: body.consumptionPerBirdGrams,
    purchaseDate: body.purchaseDate,
  };

  const payload = body.batch ? batchBody : uniqueBody;

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
