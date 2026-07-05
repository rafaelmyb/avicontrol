import { describe, it, expect } from "vitest";
import { buildMonthRange, fillMissingMonths } from "./expenses-aggregate";

describe("buildMonthRange", () => {
  it("returns N months ending at the reference month, oldest first", () => {
    const ref = new Date(Date.UTC(2025, 6, 15)); // July 2025
    const range = buildMonthRange(ref, 3);
    expect(range).toEqual([
      { year: 2025, month: 5 },
      { year: 2025, month: 6 },
      { year: 2025, month: 7 },
    ]);
  });

  it("wraps correctly across year boundaries", () => {
    const ref = new Date(Date.UTC(2025, 1, 1)); // Feb 2025
    const range = buildMonthRange(ref, 3);
    expect(range).toEqual([
      { year: 2024, month: 12 },
      { year: 2025, month: 1 },
      { year: 2025, month: 2 },
    ]);
  });

  it("returns a single month when months = 1", () => {
    const ref = new Date(Date.UTC(2025, 0, 1)); // Jan 2025
    expect(buildMonthRange(ref, 1)).toEqual([{ year: 2025, month: 1 }]);
  });
});

describe("fillMissingMonths", () => {
  it("keeps existing totals and fills zero for missing months", () => {
    const raw = [
      { year: 2025, month: 5, total: 100 },
      { year: 2025, month: 7, total: 250 },
    ];
    const range = [
      { year: 2025, month: 5 },
      { year: 2025, month: 6 },
      { year: 2025, month: 7 },
    ];
    expect(fillMissingMonths(raw, range)).toEqual([
      { year: 2025, month: 5, total: 100 },
      { year: 2025, month: 6, total: 0 },
      { year: 2025, month: 7, total: 250 },
    ]);
  });

  it("returns zeros when no raw data is provided", () => {
    const range = [
      { year: 2025, month: 1 },
      { year: 2025, month: 2 },
    ];
    expect(fillMissingMonths([], range)).toEqual([
      { year: 2025, month: 1, total: 0 },
      { year: 2025, month: 2, total: 0 },
    ]);
  });

  it("handles empty range", () => {
    expect(fillMissingMonths([], [])).toEqual([]);
  });
});
