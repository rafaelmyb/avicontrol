import type { IFeedInventoryRepository } from "../domain/repository";

export interface UpdateFeedInput {
  name?: string;
  feedType?: string;
  weightKg?: number;
  price?: number | null;
  consumptionPerBirdGrams?: number;
  purchaseDate?: string;
}

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

export async function updateFeedInventory(
  repo: IFeedInventoryRepository,
  id: string,
  userId: string,
  input: UpdateFeedInput
): Promise<FeedDto | null> {
  const data: Partial<{
    name: string;
    feedType: string;
    weightKg: number;
    price: number | null;
    consumptionPerBirdGrams: number;
    purchaseDate: Date;
  }> = {};
  if (input.name != null) data.name = input.name;
  if (input.feedType != null) data.feedType = input.feedType;
  if (input.weightKg != null) data.weightKg = input.weightKg;
  if (input.price !== undefined) data.price = input.price;
  if (input.consumptionPerBirdGrams != null)
    data.consumptionPerBirdGrams = input.consumptionPerBirdGrams;
  if (input.purchaseDate != null) data.purchaseDate = new Date(input.purchaseDate);
  const entity = await repo.update(id, userId, data);
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
