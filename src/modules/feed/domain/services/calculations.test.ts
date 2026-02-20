import { describe, it, expect } from "vitest";
import {
  dailyConsumptionGrams,
  durationDays,
  estimatedRestockDate,
} from "./calculations";

describe("dailyConsumptionGrams", () => {
  it("returns activeBirdCount * consumptionPerBirdGrams", () => {
    expect(dailyConsumptionGrams(10, 120)).toBe(1200);
    expect(dailyConsumptionGrams(0, 120)).toBe(0);
  });
});

describe("durationDays", () => {
  it("returns totalWeightKg*1000 / dailyConsumptionGrams", () => {
    expect(durationDays(100, 1000)).toBe(100); // 100kg = 100000g, 100000/1000 = 100
    expect(durationDays(1, 100)).toBe(10); // 1kg = 1000g, 1000/100 = 10
  });

  it("returns 0 when dailyConsumptionGrams is 0", () => {
    expect(durationDays(100, 0)).toBe(0);
  });
});

describe("estimatedRestockDate", () => {
  it("returns purchaseDate + durationDays", () => {
    const purchase = new Date("2024-01-01");
    const result = estimatedRestockDate(purchase, 30);
    const expected = new Date("2024-01-31");
    expect(result.toISOString().slice(0, 10)).toBe(expected.toISOString().slice(0, 10));
  });
});
