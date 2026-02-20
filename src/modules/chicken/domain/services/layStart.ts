import { DEFAULT_DAYS_TO_LAY } from "@/shared/constants";

/**
 * Pure domain: expected laying start date.
 * layStartDate = birthDate + daysToLay (default 150).
 */
export function layStartDate(birthDate: Date, daysToLay: number = DEFAULT_DAYS_TO_LAY): Date {
  const result = new Date(birthDate);
  result.setDate(result.getDate() + daysToLay);
  return result;
}
