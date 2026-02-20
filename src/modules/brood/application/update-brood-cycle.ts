import type { IBroodCycleRepository } from "../domain/repository";
import type { IChickenRepository } from "@/modules/chicken/domain/repository";

export interface UpdateBroodCycleInput {
  actualHatchedCount?: number;
  status?: string;
}

export interface BroodCycleDto {
  id: string;
  chickenId: string;
  startDate: string;
  eggCount: number;
  expectedHatchDate: string;
  expectedReturnToLayDate: string;
  actualHatchedCount: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function updateBroodCycle(
  repo: IBroodCycleRepository,
  id: string,
  input: UpdateBroodCycleInput,
  chickenRepo?: IChickenRepository,
  userId?: string
): Promise<BroodCycleDto | null> {
  const existing = await repo.findById(id);
  if (!existing) return null;
  const entity = await repo.update(id, input);
  if (!entity) return null;
  if (
    chickenRepo &&
    userId &&
    (input.status === "hatched" || input.status === "completed")
  ) {
    await chickenRepo.update(existing.chickenId, userId, { status: "recovering" });
  }
  return {
    id: entity.id,
    chickenId: entity.chickenId,
    startDate: entity.startDate.toISOString(),
    eggCount: entity.eggCount,
    expectedHatchDate: entity.expectedHatchDate.toISOString(),
    expectedReturnToLayDate: entity.expectedReturnToLayDate.toISOString(),
    actualHatchedCount: entity.actualHatchedCount,
    status: entity.status,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
