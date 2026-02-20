import type { IBroodCycleRepository } from "../domain/repository";

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

export async function getBroodCycle(
  repo: IBroodCycleRepository,
  id: string,
  userId: string
): Promise<BroodCycleDto | null> {
  const entity = await repo.findByIdAndUserId(id, userId);
  if (!entity) return null;
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
