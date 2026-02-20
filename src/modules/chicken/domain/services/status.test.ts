import { describe, it, expect } from "vitest";
import { updateChickenStatus } from "./status";

describe("updateChickenStatus", () => {
  it("returns chick when age < 30 and not in brood", () => {
    expect(
      updateChickenStatus(29, { isInBrood: false }, "chick")
    ).toBe("chick");
  });

  it("returns pullet when 30 <= age < 150 and not in brood", () => {
    expect(
      updateChickenStatus(30, { isInBrood: false }, "chick")
    ).toBe("pullet");
    expect(
      updateChickenStatus(149, { isInBrood: false }, "pullet")
    ).toBe("pullet");
  });

  it("returns laying when age >= 150 and not in brood", () => {
    expect(
      updateChickenStatus(150, { isInBrood: false }, "pullet")
    ).toBe("laying");
  });

  it("returns brooding when in brood and no return date", () => {
    expect(
      updateChickenStatus(200, { isInBrood: true }, "laying")
    ).toBe("brooding");
  });

  it("returns recovering when in brood with future return date", () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    expect(
      updateChickenStatus(200, { isInBrood: true, expectedReturnToLayDate: future }, "laying")
    ).toBe("recovering");
  });

  it("returns laying when in brood but past return date", () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    expect(
      updateChickenStatus(200, { isInBrood: true, expectedReturnToLayDate: past }, "recovering")
    ).toBe("laying");
  });

  it("preserves retired, sold, deceased", () => {
    expect(
      updateChickenStatus(200, { isInBrood: false }, "retired")
    ).toBe("retired");
    expect(
      updateChickenStatus(200, { isInBrood: false }, "sold")
    ).toBe("sold");
    expect(
      updateChickenStatus(200, { isInBrood: false }, "deceased")
    ).toBe("deceased");
  });
});
