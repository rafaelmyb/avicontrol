import { describe, it, expect } from "vitest";
import { layStartDate } from "./layStart";

describe("layStartDate", () => {
  it("returns birthDate + 150 days by default", () => {
    const birth = new Date("2024-01-01");
    const result = layStartDate(birth);
    const expected = new Date("2024-01-01");
    expected.setDate(expected.getDate() + 150);
    expect(result.toISOString().slice(0, 10)).toBe(expected.toISOString().slice(0, 10));
  });

  it("respects custom daysToLay", () => {
    const birth = new Date("2024-01-01");
    const result = layStartDate(birth, 120);
    const expected = new Date("2024-01-01");
    expected.setDate(expected.getDate() + 120);
    expect(result.toISOString().slice(0, 10)).toBe(expected.toISOString().slice(0, 10));
  });
});
