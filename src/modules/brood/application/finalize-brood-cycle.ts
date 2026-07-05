/**
 * Application use case: finalize a brood cycle.
 *
 * The pure function `buildFinalizePayload` encapsulates the domain rule
 * "finalizar choco => status hatched" and is the single source of truth
 * for the status value, keeping it out of the UI layer.
 */

export const BROOD_HATCHED_STATUS = "hatched" as const;

export interface FinalizeBroodInput {
  actualHatchedCount: number;
}

export interface FinalizePayload {
  actualHatchedCount: number;
  status: typeof BROOD_HATCHED_STATUS;
}

export type FinalizeErrorKey = "hatchedCountInvalid" | "hatchedCountExceedsEggs";

export type FinalizeResult =
  | ({ ok: true } & FinalizePayload)
  | { ok: false; errorKey: FinalizeErrorKey };

/**
 * Pure domain function — no I/O, fully testable.
 *
 * Validates the hatched count and returns either the finalization payload
 * (with status locked to "hatched") or a structured error key for the UI.
 */
export function buildFinalizePayload(
  input: FinalizeBroodInput,
  eggCount?: number
): FinalizeResult {
  if (
    !Number.isInteger(input.actualHatchedCount) ||
    input.actualHatchedCount < 0
  ) {
    return { ok: false, errorKey: "hatchedCountInvalid" };
  }
  if (eggCount !== undefined && input.actualHatchedCount > eggCount) {
    return { ok: false, errorKey: "hatchedCountExceedsEggs" };
  }
  return {
    ok: true,
    actualHatchedCount: input.actualHatchedCount,
    status: BROOD_HATCHED_STATUS,
  };
}
