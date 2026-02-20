import type { BroodCycleEntity, CreateBroodCycleInput } from "./entities";

export type BroodOrderBy = "expectedHatchDate" | "startDate" | "createdAt";

export interface BroodListOptions {
  orderBy?: BroodOrderBy;
  orderDirection?: "asc" | "desc";
  skip?: number;
  take?: number;
}

export interface IBroodCycleRepository {
  create(data: CreateBroodCycleInput): Promise<BroodCycleEntity>;
  findById(id: string): Promise<BroodCycleEntity | null>;
  findByChickenId(chickenId: string): Promise<BroodCycleEntity[]>;
  findByUserId(userId: string, options?: BroodListOptions): Promise<BroodCycleEntity[]>;
  countByUserId(userId: string): Promise<number>;
  findByIdAndUserId(id: string, userId: string): Promise<BroodCycleEntity | null>;
  update(
    id: string,
    data: Partial<Pick<BroodCycleEntity, "actualHatchedCount" | "status">>
  ): Promise<BroodCycleEntity | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
