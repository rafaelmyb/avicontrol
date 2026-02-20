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

function toDto(entity: {
  id: string;
  chickenId: string;
  startDate: Date;
  eggCount: number;
  expectedHatchDate: Date;
  expectedReturnToLayDate: Date;
  actualHatchedCount: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): BroodCycleDto {
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

export async function listBroodCyclesByUser(
  repo: IBroodCycleRepository,
  userId: string
): Promise<BroodCycleDto[]> {
  const list = await repo.findByUserId(userId);
  return list.map(toDto);
}

export async function listBroodCyclesByChicken(
  repo: IBroodCycleRepository,
  chickenId: string
): Promise<BroodCycleDto[]> {
  const list = await repo.findByChickenId(chickenId);
  return list.map(toDto);
}
