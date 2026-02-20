import { describe, it, expect } from "vitest";
import { ageInDays } from "./age";

describe("ageInDays", () => {
  it("returns 0 when same day", () => {
    const d = new Date("2024-01-15");
    expect(ageInDays(d, d)).toBe(0);
  });

  it("returns 1 for one day later", () => {
    const birth = new Date("2024-01-15");
    const current = new Date("2024-01-16");
    expect(ageInDays(birth, current)).toBe(1);
  });

  it("returns 150 for 150 days later", () => {
    const birth = new Date("2024-01-01");
    const current = new Date("2024-05-30"); // 150 days
    expect(ageInDays(birth, current)).toBe(150);
  });

  it("returns negative when current is before birth", () => {
    const birth = new Date("2024-01-15");
    const current = new Date("2024-01-10");
    expect(ageInDays(birth, current)).toBe(-5);
  });
});
