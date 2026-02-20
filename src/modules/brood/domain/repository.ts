import type { BroodCycleEntity, CreateBroodCycleInput } from "./entities";

export interface IBroodCycleRepository {
  create(data: CreateBroodCycleInput): Promise<BroodCycleEntity>;
  findById(id: string): Promise<BroodCycleEntity | null>;
  findByChickenId(chickenId: string): Promise<BroodCycleEntity[]>;
  findByUserId(userId: string): Promise<BroodCycleEntity[]>;
  update(
    id: string,
    data: Partial<Pick<BroodCycleEntity, "actualHatchedCount" | "status">>
  ): Promise<BroodCycleEntity | null>;
}
