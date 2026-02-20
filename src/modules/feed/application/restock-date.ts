import type { IFeedInventoryRepository } from "../domain/repository";
import {
  dailyConsumptionGrams,
  durationDays,
  estimatedRestockDate,
} from "../domain/services/calculations";

export interface RestockInfo {
  feedId: string;
  name: string;
  estimatedRestockDate: Date;
  durationDays: number;
}

/**
 * Compute which feed will run out first for the user (earliest restock date).
 */
export async function computeNextRestock(
  repo: IFeedInventoryRepository,
  userId: string,
  activeBirdCount: number
): Promise<RestockInfo | null> {
  const list = await repo.findByUserId(userId);
  if (list.length === 0 || activeBirdCount <= 0) return null;

  let earliest: RestockInfo | null = null;

  for (const feed of list) {
    const dailyGrams = dailyConsumptionGrams(
      activeBirdCount,
      feed.consumptionPerBirdGrams
    );
    const days = durationDays(feed.weightKg, dailyGrams);
    const restock = estimatedRestockDate(feed.purchaseDate, days);
    if (!earliest || restock < earliest.estimatedRestockDate) {
      earliest = {
        feedId: feed.id,
        name: feed.name,
        estimatedRestockDate: restock,
        durationDays: days,
      };
    }
  }
  return earliest;
}
