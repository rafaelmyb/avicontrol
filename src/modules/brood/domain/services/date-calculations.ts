import { BROOD_INCUBATION_DAYS } from "@/shared/constants";
import { DEFAULT_RECOVERY_DAYS_AFTER_HATCH } from "@/shared/constants";

/**
 * Pure domain: expected hatch date = startDate + 21 days.
 */
export function expectedHatchDate(startDate: Date): Date {
  const result = new Date(startDate);
  result.setDate(result.getDate() + BROOD_INCUBATION_DAYS);
  return result;
}

/**
 * Pure domain: expected return to lay date = hatchDate + recovery days.
 */
export function expectedReturnToLayDate(
  hatchDate: Date,
  recoveryDays: number = DEFAULT_RECOVERY_DAYS_AFTER_HATCH
): Date {
  const result = new Date(hatchDate);
  result.setDate(result.getDate() + recoveryDays);
  return result;
}
