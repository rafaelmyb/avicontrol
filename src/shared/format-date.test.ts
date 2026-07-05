import { describe, it, expect, vi, afterEach } from "vitest";
import { formatDateOnly, todayLocalISODate } from "./format-date";

describe("formatDateOnly", () => {
  it("formats a date-only ISO string correctly", () => {
    expect(formatDateOnly("2024-01-15")).toBe("15/01/2024");
  });

  it("formats an ISO datetime string using only the date part (no timezone shift)", () => {
    // "2024-01-15T00:00:00.000Z" is midnight UTC — must display 15/01, not 14/01
    expect(formatDateOnly("2024-01-15T00:00:00.000Z")).toBe("15/01/2024");
  });

  it("handles month boundaries correctly", () => {
    expect(formatDateOnly("2024-03-01")).toBe("01/03/2024");
    expect(formatDateOnly("2024-12-31")).toBe("31/12/2024");
  });

  it("returns the original string if parsing fails", () => {
    expect(formatDateOnly("not-a-date")).toBe("not-a-date");
  });

  it("handles timestamps that would shift to the previous day in UTC-3", () => {
    // "2024-07-10T00:00:00.000Z" is 2024-07-09T21:00:00 in UTC-3.
    // toLocaleDateString on this Date would show 09/07 in UTC-3.
    // formatDateOnly must still return 10/07/2024 by using the date part directly.
    expect(formatDateOnly("2024-07-10T00:00:00.000Z")).toBe("10/07/2024");
  });
});

describe("todayLocalISODate", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a string in YYYY-MM-DD format", () => {
    const result = todayLocalISODate();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns the LOCAL date, not the UTC date", () => {
    // Simulate being in UTC-3 at 23:30 on 2024-01-15.
    // UTC equivalent: 2024-01-16T02:30:00Z — tomorrow in UTC.
    // todayLocalISODate() must return "2024-01-15" (the local date).
    const fakeNow = new Date("2024-01-16T02:30:00Z");
    vi.setSystemTime(fakeNow);

    const result = todayLocalISODate();

    // The result must match the LOCAL year/month/day of fakeNow.
    const now = new Date(fakeNow);
    const expected = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("-");

    expect(result).toBe(expected);
    // In a UTC environment (as in CI), fakeNow local date is 2024-01-16.
    // In a UTC-3 environment, it would be 2024-01-15.
    // Either way, the function must agree with the local Date getters.
  });

  it("pads month and day with leading zeros", () => {
    vi.setSystemTime(new Date("2024-03-05T10:00:00Z"));
    const result = todayLocalISODate();
    // Date portion must have zero-padded month and day
    const parts = result.split("-");
    expect(parts[1]).toHaveLength(2);
    expect(parts[2]).toHaveLength(2);
  });
});
