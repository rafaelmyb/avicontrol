/**
 * Pure domain: monthly egg production = layingChickensCount * averageEggsPerMonth.
 * Chickens in brooding or recovering are excluded at call site (count only laying).
 */
export function monthlyEggProduction(
  layingChickensCount: number,
  averageEggsPerMonth: number
): number {
  return layingChickensCount * averageEggsPerMonth;
}
