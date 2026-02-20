import type { IFeedInventoryRepository } from "../domain/repository";

export interface FeedDto {
  id: string;
  userId: string;
  name: string;
  feedType: string;
  weightKg: number;
  price: number | null;
  consumptionPerBirdGrams: number;
  purchaseDate: string;
  createdAt: string;
  updatedAt: string;
}

export async function listFeedInventoryByUser(
  repo: IFeedInventoryRepository,
  userId: string
): Promise<FeedDto[]> {
  const list = await repo.findByUserId(userId);
  return list.map((e) => ({
    id: e.id,
    userId: e.userId,
    name: e.name,
    feedType: e.feedType,
    weightKg: e.weightKg,
    price: e.price,
    consumptionPerBirdGrams: e.consumptionPerBirdGrams,
    purchaseDate: e.purchaseDate.toISOString(),
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));
}
