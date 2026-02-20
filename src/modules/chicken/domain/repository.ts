import type { ChickenEntity, CreateChickenInput } from "./entities";

export interface IChickenRepository {
  create(data: CreateChickenInput): Promise<ChickenEntity>;
  findById(id: string, userId: string): Promise<ChickenEntity | null>;
  findByUserId(userId: string, options?: { skip?: number; take?: number }): Promise<ChickenEntity[]>;
  countByUserId(userId: string): Promise<number>;
  update(
    id: string,
    userId: string,
    data: Partial<Pick<ChickenEntity, "name" | "breed" | "birthDate" | "status">>
  ): Promise<ChickenEntity | null>;
  delete(id: string, userId: string): Promise<boolean>;
}
