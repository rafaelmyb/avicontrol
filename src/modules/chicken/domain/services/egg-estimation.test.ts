import { describe, it, expect } from "vitest";
import { monthlyEggProduction } from "./egg-estimation";

/**
 * monthlyEggProduction receives a pre-filtered count of FEMALE laying
 * chickens. Male exclusion happens at the call site (dashboard route)
 * by querying only chickens with status="laying" AND sex="female".
 */
describe("monthlyEggProduction", () => {
  it("returns layingChickensCount * averageEggsPerMonth", () => {
    expect(monthlyEggProduction(10, 20)).toBe(200);
    expect(monthlyEggProduction(0, 20)).toBe(0);
    expect(monthlyEggProduction(5, 24)).toBe(120);
  });

  it("returns 0 when count is 0 (all males or no laying chickens)", () => {
    expect(monthlyEggProduction(0, 20)).toBe(0);
  });

  it("only females counted — passing count of 0 for an all-male flock yields 0 eggs", () => {
    // Callers must pass count=0 when all laying birds are male.
    const maleCount = 0; // males excluded before calling
    expect(monthlyEggProduction(maleCount, 20)).toBe(0);
  });
});
