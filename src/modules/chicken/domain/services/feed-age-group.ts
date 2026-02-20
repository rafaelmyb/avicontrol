import { ageInDays } from "./age";
import { CHICK_MAX_DAYS, PULLET_MAX_DAYS } from "@/shared/constants";

export interface FeedAgeGroupCounts {
  chickCount: number;
  pulletCount: number;
  henCount: number;
}

/**
 * Count active chickens by feed age group for restock calculation.
 * Chicks: age <= 21 days (pré-inicial).
 * Pullets: 22 days <= age < 5 months (crescimento).
 * Hens: age >= 5 months (postura).
 */
export function countChickensByFeedAgeGroup(
  birthDates: { birthDate: Date }[],
  referenceDate: Date
): FeedAgeGroupCounts {
  let chickCount = 0;
  let pulletCount = 0;
  let henCount = 0;

  for (const { birthDate } of birthDates) {
    const age = ageInDays(birthDate, referenceDate);
    if (age <= CHICK_MAX_DAYS) {
      chickCount += 1;
    } else if (age < PULLET_MAX_DAYS) {
      pulletCount += 1;
    } else {
      henCount += 1;
    }
  }

  return { chickCount, pulletCount, henCount };
}
