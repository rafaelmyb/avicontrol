import { describe, it, expect } from "vitest";
import { monthlyEggProduction } from "./egg-estimation";

describe("monthlyEggProduction", () => {
  it("returns layingChickensCount * averageEggsPerMonth", () => {
    expect(monthlyEggProduction(10, 20)).toBe(200);
    expect(monthlyEggProduction(0, 20)).toBe(0);
    expect(monthlyEggProduction(5, 24)).toBe(120);
  });
});
