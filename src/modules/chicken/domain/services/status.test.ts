import { describe, it, expect } from "vitest";
import { updateChickenStatus } from "./status";

describe("updateChickenStatus", () => {
  // ──────────── Female (default) ────────────
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

  it("preserves retired, sold, deceased for females", () => {
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

  // ──────────── Male (rooster) ────────────
  it("male chick stays chick when age < 30", () => {
    expect(
      updateChickenStatus(10, { isInBrood: false }, "chick", "male")
    ).toBe("chick");
  });

  it("male returns pullet when 30 <= age < 150", () => {
    expect(
      updateChickenStatus(30, { isInBrood: false }, "chick", "male")
    ).toBe("pullet");
    expect(
      updateChickenStatus(149, { isInBrood: false }, "pullet", "male")
    ).toBe("pullet");
  });

  it("adult male (age >= 150) stays pullet — never transitions to laying", () => {
    expect(
      updateChickenStatus(150, { isInBrood: false }, "pullet", "male")
    ).toBe("pullet");
    expect(
      updateChickenStatus(500, { isInBrood: false }, "pullet", "male")
    ).toBe("pullet");
  });

  it("male ignores brood context — never becomes brooding or recovering", () => {
    expect(
      updateChickenStatus(200, { isInBrood: true }, "laying", "male")
    ).toBe("pullet");
    const future = new Date();
    future.setDate(future.getDate() + 10);
    expect(
      updateChickenStatus(200, { isInBrood: true, expectedReturnToLayDate: future }, "brooding", "male")
    ).toBe("pullet");
  });

  it("preserves retired, sold, deceased for males", () => {
    expect(
      updateChickenStatus(200, { isInBrood: false }, "retired", "male")
    ).toBe("retired");
    expect(
      updateChickenStatus(200, { isInBrood: false }, "sold", "male")
    ).toBe("sold");
    expect(
      updateChickenStatus(200, { isInBrood: false }, "deceased", "male")
    ).toBe("deceased");
  });
});
