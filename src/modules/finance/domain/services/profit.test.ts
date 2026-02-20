import { describe, it, expect } from "vitest";
import {
  monthlyProfit,
  annualProjectionFromMonthlyProfit,
} from "./profit";

describe("monthlyProfit", () => {
  it("returns totalRevenue - totalExpenses", () => {
    expect(monthlyProfit(1000, 600)).toBe(400);
    expect(monthlyProfit(500, 700)).toBe(-200);
  });
});

describe("annualProjectionFromMonthlyProfit", () => {
  it("returns averageMonthlyProfit * 12", () => {
    expect(annualProjectionFromMonthlyProfit(400)).toBe(4800);
    expect(annualProjectionFromMonthlyProfit(0)).toBe(0);
  });
});
