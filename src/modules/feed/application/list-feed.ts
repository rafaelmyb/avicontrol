import type { IFeedInventoryRepository, FeedListOptions } from "../domain/repository";

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
  userId: string,
  options?: FeedListOptions
): Promise<{ list: FeedDto[]; total: number }> {
  const countFilter = options?.feedType ? { feedType: options.feedType } : undefined;
  const [list, total] = await Promise.all([
    repo.findByUserId(userId, options),
    repo.countByUserId(userId, countFilter),
  ]);
  return {
    list: list.map((e) => ({
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
    })),
    total,
  };
}
