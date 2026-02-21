import type { ChickenEntity, CreateChickenInput } from "./entities";

export type ChickenListOrderBy = "createdAt" | "name" | "birthDate";
export type ChickenListOrderDirection = "asc" | "desc";

export interface ChickenListOptions {
  skip?: number;
  take?: number;
  status?: string;
  batchName?: string;
  orderBy?: ChickenListOrderBy;
  orderDirection?: ChickenListOrderDirection;
}

export interface IChickenRepository {
  create(data: CreateChickenInput): Promise<ChickenEntity>;
  findById(id: string, userId: string): Promise<ChickenEntity | null>;
  findByUserId(userId: string, options?: ChickenListOptions): Promise<ChickenEntity[]>;
  countByUserId(userId: string, options?: Pick<ChickenListOptions, "status" | "batchName">): Promise<number>;
  update(
    id: string,
    userId: string,
    data: Partial<Pick<ChickenEntity, "name" | "breed" | "birthDate" | "status" | "source" | "purchasePrice">>
  ): Promise<ChickenEntity | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
