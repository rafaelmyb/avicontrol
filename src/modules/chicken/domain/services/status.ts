import type { ChickenStatus } from "../entities";

export interface BroodContext {
  isInBrood: boolean;
  expectedReturnToLayDate?: Date;
}

/**
 * Pure domain: derive chicken status from age and brood context.
 * chick -> pullet -> laying; brooding/recovering from brood; retired/sold/deceased set elsewhere.
 */
export function updateChickenStatus(
  ageInDays: number,
  broodContext: BroodContext,
  currentStatus: ChickenStatus
): ChickenStatus {
  if (["retired", "sold", "deceased"].includes(currentStatus)) {
    return currentStatus;
  }

  if (broodContext.isInBrood) {
    if (broodContext.expectedReturnToLayDate) {
      const now = new Date();
      if (now >= broodContext.expectedReturnToLayDate) {
        return "laying";
      }
      return "recovering";
    }
    return "brooding";
  }

  if (ageInDays < 30) return "chick";
  if (ageInDays < 150) return "pullet";
  return "laying";
}
