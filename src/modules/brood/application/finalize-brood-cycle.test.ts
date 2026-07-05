import { describe, it, expect } from "vitest";
import { buildFinalizePayload, BROOD_HATCHED_STATUS } from "./finalize-brood-cycle";

describe("buildFinalizePayload", () => {
  it("returns status 'hatched' and correct count for valid input", () => {
    const result = buildFinalizePayload({ actualHatchedCount: 5 }, 10);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.status).toBe(BROOD_HATCHED_STATUS);
      expect(result.actualHatchedCount).toBe(5);
    }
  });

  it("accepts zero eclodidos (all eggs failed)", () => {
    const result = buildFinalizePayload({ actualHatchedCount: 0 }, 5);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.actualHatchedCount).toBe(0);
    }
  });

  it("accepts count equal to eggCount", () => {
    const result = buildFinalizePayload({ actualHatchedCount: 10 }, 10);
    expect(result.ok).toBe(true);
  });

  it("returns hatchedCountInvalid for negative count", () => {
    const result = buildFinalizePayload({ actualHatchedCount: -1 }, 10);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorKey).toBe("hatchedCountInvalid");
    }
  });

  it("returns hatchedCountInvalid for non-integer count", () => {
    const result = buildFinalizePayload({ actualHatchedCount: 2.5 }, 10);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorKey).toBe("hatchedCountInvalid");
    }
  });

  it("returns hatchedCountExceedsEggs when count exceeds eggCount", () => {
    const result = buildFinalizePayload({ actualHatchedCount: 11 }, 10);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorKey).toBe("hatchedCountExceedsEggs");
    }
  });

  it("allows any valid count when eggCount is undefined", () => {
    const result = buildFinalizePayload({ actualHatchedCount: 999 });
    expect(result.ok).toBe(true);
  });

  it("BROOD_HATCHED_STATUS constant is 'hatched'", () => {
    expect(BROOD_HATCHED_STATUS).toBe("hatched");
  });
});
