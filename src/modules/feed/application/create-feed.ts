import type { IFeedInventoryRepository } from "../domain/repository";
import type { CreateFeedInventoryInput } from "../domain/entities";

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

export async function createFeedInventory(
  repo: IFeedInventoryRepository,
  input: CreateFeedInventoryInput
): Promise<FeedDto> {
  const entity = await repo.create(input);
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
