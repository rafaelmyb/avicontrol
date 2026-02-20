import { describe, it, expect } from "vitest";
import { expectedHatchDate, expectedReturnToLayDate } from "./date-calculations";

describe("expectedHatchDate", () => {
  it("returns startDate + 21 days", () => {
    const start = new Date("2024-01-01");
    const result = expectedHatchDate(start);
    const expected = new Date("2024-01-22");
    expect(result.toISOString().slice(0, 10)).toBe(expected.toISOString().slice(0, 10));
  });
});

describe("expectedReturnToLayDate", () => {
  it("returns hatchDate + 14 days by default", () => {
    const hatch = new Date("2024-01-22");
    const result = expectedReturnToLayDate(hatch);
    const expected = new Date("2024-02-05");
    expect(result.toISOString().slice(0, 10)).toBe(expected.toISOString().slice(0, 10));
  });

  it("respects custom recovery days", () => {
    const hatch = new Date("2024-01-22");
    const result = expectedReturnToLayDate(hatch, 7);
    const expected = new Date("2024-01-29");
    expect(result.toISOString().slice(0, 10)).toBe(expected.toISOString().slice(0, 10));
  });
});
