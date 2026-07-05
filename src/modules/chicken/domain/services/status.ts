import type { ChickenSex, ChickenStatus } from "../entities";

export interface BroodContext {
  isInBrood: boolean;
  expectedReturnToLayDate?: Date;
}

/**
 * Pure domain: derive chicken status from age, brood context, and sex.
 *
 * Female path: chick -> pullet -> laying; brooding/recovering from brood.
 * Male path (roosters): chick -> pullet; males never transition to laying,
 *   brooding or recovering automatically. Adult males (age >= 150) remain
 *   "pullet" — the least disruptive non-productive status that preserves the
 *   age-based progression without introducing a new status value.
 *
 * Terminal statuses (retired/sold/deceased) are preserved for all sexes.
 */
export function updateChickenStatus(
  ageInDays: number,
  broodContext: BroodContext,
  currentStatus: ChickenStatus,
  sex: ChickenSex = "female"
): ChickenStatus {
  if (["retired", "sold", "deceased"].includes(currentStatus)) {
    return currentStatus;
  }

  // Males never lay, brood or recover — skip brood context entirely.
  if (sex === "male") {
    if (ageInDays < 30) return "chick";
    return "pullet";
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
