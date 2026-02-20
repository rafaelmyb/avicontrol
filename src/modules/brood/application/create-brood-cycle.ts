import type { IBroodCycleRepository } from "../domain/repository";
import type { IChickenRepository } from "@/modules/chicken/domain/repository";
import { expectedHatchDate, expectedReturnToLayDate } from "../domain/services/date-calculations";

export interface CreateBroodCycleCommand {
  chickenId: string;
  userId: string;
  startDate: Date;
  eggCount: number;
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

export async function createBroodCycle(
  broodRepo: IBroodCycleRepository,
  chickenRepo: IChickenRepository,
  cmd: CreateBroodCycleCommand
): Promise<BroodCycleDto> {
  const chicken = await chickenRepo.findById(cmd.chickenId, cmd.userId);
  if (!chicken) throw new Error("Chicken not found");

  const expectedHatch = expectedHatchDate(cmd.startDate);
  const expectedReturn = expectedReturnToLayDate(expectedHatch);

  const entity = await broodRepo.create({
    chickenId: cmd.chickenId,
    startDate: cmd.startDate,
    eggCount: cmd.eggCount,
    expectedHatchDate: expectedHatch,
    expectedReturnToLayDate: expectedReturn,
    status: "active",
  });

  await chickenRepo.update(cmd.chickenId, cmd.userId, { status: "brooding" });

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
