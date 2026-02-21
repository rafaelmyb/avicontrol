import type { IFeedInventoryRepository, RestockDataRow } from "../domain/repository";
import {
  dailyConsumptionGrams,
  durationDays,
  estimatedRestockDate,
} from "../domain/services/calculations";
import { FEED_TYPE_LABELS, FEED_TYPE_VALUES } from "@/shared/feed-types";
import type { FeedTypeValue } from "@/shared/feed-types";

export interface RestockInfo {
  feedId: string;
  name: string;
  estimatedRestockDate: Date;
  durationDays: number;
}

export interface RestockByTypeInput {
  chickCount: number;
  pulletCount: number;
  henCount: number;
}

export interface RestockAlertByType {
  feedType: FeedTypeValue;
  label: string;
  date: string | null;
}

const FEED_TYPE_TO_BIRD_COUNT = (
  counts: RestockByTypeInput
): Record<FeedTypeValue, number> => ({
  pre_inicial: counts.chickCount,
  crescimento: counts.pulletCount,
  postura: counts.henCount,
});

/**
 * Compute restock date per feed type from minimal data (e.g. from findRestockDataByUserId).
 * Use this in the dashboard to avoid loading full feed rows.
 */
export function computeRestockByFeedTypeFromData(
  list: RestockDataRow[],
  counts: RestockByTypeInput
): RestockAlertByType[] {
  const birdByType = FEED_TYPE_TO_BIRD_COUNT(counts);

  return FEED_TYPE_VALUES.map((feedType) => {
    const rows = list.filter((f) => f.feedType === feedType);
    const birdCount = birdByType[feedType];
    const label = FEED_TYPE_LABELS[feedType];

    if (rows.length === 0 || birdCount <= 0) {
      return { feedType, label, date: null };
    }

    const totalWeightKg = rows.reduce((sum, r) => sum + r.weightKg, 0);
    const latest = rows.reduce((a, b) =>
      a.purchaseDate >= b.purchaseDate ? a : b
    );
    const dailyGrams = dailyConsumptionGrams(
      birdCount,
      latest.consumptionPerBirdGrams
    );
    const days = durationDays(totalWeightKg, dailyGrams);
    const restock = estimatedRestockDate(latest.purchaseDate, days);

    return {
      feedType,
      label,
      date: restock.toISOString(),
    };
  });
}

/**
 * Compute restock date per feed type. One entry per type (pré-inicial, crescimento, postura).
 * Uses most recent purchaseDate per type and sum of weightKg per type.
 */
export async function computeRestockByFeedType(
  repo: IFeedInventoryRepository,
  userId: string,
  counts: RestockByTypeInput
): Promise<RestockAlertByType[]> {
  const list = await repo.findByUserId(userId);
  return computeRestockByFeedTypeFromData(list, counts);
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
