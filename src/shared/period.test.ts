import { describe, it, expect } from "vitest";
import { getDateRangeFromPreset, scaledEggProduction } from "./period";

const MIDNIGHT = (y: number, m: number, d: number) => new Date(y, m - 1, d, 0, 0, 0, 0);
const EOD = (y: number, m: number, d: number) => new Date(y, m - 1, d, 23, 59, 59, 999);

describe("getDateRangeFromPreset", () => {
  describe("current_month", () => {
    it("starts on the 1st of the current month at midnight", () => {
      const now = new Date(2026, 6, 15); // July 15, 2026
      const { from } = getDateRangeFromPreset("current_month", now);
      expect(from).toEqual(MIDNIGHT(2026, 7, 1));
    });

    it("ends on the last day of the current month at end-of-day", () => {
      const now = new Date(2026, 6, 15); // July 2026 (31-day month)
      const { to } = getDateRangeFromPreset("current_month", now);
      expect(to).toEqual(EOD(2026, 7, 31));
    });

    it("handles February in a non-leap year correctly", () => {
      const now = new Date(2026, 1, 10); // Feb 10, 2026
      const { from, to } = getDateRangeFromPreset("current_month", now);
      expect(from).toEqual(MIDNIGHT(2026, 2, 1));
      expect(to).toEqual(EOD(2026, 2, 28));
    });

    it("handles February in a leap year correctly", () => {
      const now = new Date(2024, 1, 10); // Feb 10, 2024 (leap year)
      const { to } = getDateRangeFromPreset("current_month", now);
      expect(to).toEqual(EOD(2024, 2, 29));
    });
  });

  describe("last_30_days", () => {
    it("ends today at end-of-day", () => {
      const now = new Date(2026, 6, 5); // July 5, 2026
      const { to } = getDateRangeFromPreset("last_30_days", now);
      expect(to).toEqual(EOD(2026, 7, 5));
    });

    it("starts 29 calendar days before today at midnight (30 days inclusive)", () => {
      const now = new Date(2026, 6, 5); // July 5, 2026
      const { from } = getDateRangeFromPreset("last_30_days", now);
      // July 5 − 29 days = June 6
      expect(from).toEqual(MIDNIGHT(2026, 6, 6));
    });

    it("rolls back across month boundaries correctly", () => {
      const now = new Date(2026, 0, 10); // Jan 10, 2026
      const { from } = getDateRangeFromPreset("last_30_days", now);
      // Jan 10 − 29 = Dec 12, 2025
      expect(from).toEqual(MIDNIGHT(2025, 12, 12));
    });
  });

  describe("current_year", () => {
    it("starts on Jan 1 at midnight", () => {
      const now = new Date(2026, 6, 5);
      const { from } = getDateRangeFromPreset("current_year", now);
      expect(from).toEqual(MIDNIGHT(2026, 1, 1));
    });

    it("ends on Dec 31 at end-of-day", () => {
      const now = new Date(2026, 6, 5);
      const { to } = getDateRangeFromPreset("current_year", now);
      expect(to).toEqual(EOD(2026, 12, 31));
    });
  });
});

describe("scaledEggProduction", () => {
  const EGGS_PER_MONTH = 20;

  it("returns exact monthly value for a 30-day range", () => {
    const from = MIDNIGHT(2026, 6, 6);
    const to = EOD(2026, 7, 5); // 30 days inclusive
    expect(scaledEggProduction(10, EGGS_PER_MONTH, from, to)).toBeCloseTo(200, 5);
  });

  it("scales proportionally for a 31-day month (July)", () => {
    const from = MIDNIGHT(2026, 7, 1);
    const to = EOD(2026, 7, 31); // 31 days
    const result = scaledEggProduction(10, EGGS_PER_MONTH, from, to);
    expect(result).toBeCloseTo(10 * 20 * (31 / 30), 5);
  });

  it("scales correctly for a full year (365 days)", () => {
    const from = MIDNIGHT(2026, 1, 1);
    const to = EOD(2026, 12, 31); // 365 days
    const result = scaledEggProduction(1, EGGS_PER_MONTH, from, to);
    expect(result).toBeCloseTo(20 * (365 / 30), 5);
  });

  it("returns 0 for zero laying chickens", () => {
    const from = MIDNIGHT(2026, 7, 1);
    const to = EOD(2026, 7, 31);
    expect(scaledEggProduction(0, EGGS_PER_MONTH, from, to)).toBe(0);
  });

  it("returns 0 for zero average eggs per month", () => {
    const from = MIDNIGHT(2026, 7, 1);
    const to = EOD(2026, 7, 31);
    expect(scaledEggProduction(10, 0, from, to)).toBe(0);
  });
});
