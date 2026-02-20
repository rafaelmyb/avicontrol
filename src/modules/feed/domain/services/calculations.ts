/**
 * Pure domain: daily consumption in grams = activeBirdCount * consumptionPerBirdGrams.
 */
export function dailyConsumptionGrams(
  activeBirdCount: number,
  consumptionPerBirdGrams: number
): number {
  return activeBirdCount * consumptionPerBirdGrams;
}

/**
 * Pure domain: duration in days = totalWeightKg (converted to grams) / dailyConsumptionGrams.
 */
export function durationDays(
  totalWeightKg: number,
  dailyConsumptionGrams: number
): number {
  if (dailyConsumptionGrams <= 0) return 0;
  const totalGrams = totalWeightKg * 1000;
  return Math.floor(totalGrams / dailyConsumptionGrams);
}

/**
 * Pure domain: estimated restock date = purchaseDate + durationDays.
 */
export function estimatedRestockDate(
  purchaseDate: Date,
  durationDays: number
): Date {
  const result = new Date(purchaseDate);
  result.setDate(result.getDate() + durationDays);
  return result;
}
