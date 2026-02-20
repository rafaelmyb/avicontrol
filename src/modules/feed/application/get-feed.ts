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

export async function getFeedInventory(
  repo: IFeedInventoryRepository,
  id: string,
  userId: string
): Promise<FeedDto | null> {
  const entity = await repo.findById(id, userId);
  if (!entity) return null;
  return {
    id: entity.id,
    userId: entity.userId,
    name: entity.name,
    feedType: entity.feedType,
    weightKg: entity.weightKg,
    price: entity.price,
    consumptionPerBirdGrams: entity.consumptionPerBirdGrams,
    purchaseDate: entity.purchaseDate.toISOString(),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
