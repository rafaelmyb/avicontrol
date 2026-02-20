import type { IRevenueRepository } from "../domain/repository";
import type { CreateRevenueInput } from "../domain/entities";

export interface RevenueDto {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  source: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export async function createRevenue(
  repo: IRevenueRepository,
  input: CreateRevenueInput
): Promise<RevenueDto> {
  const entity = await repo.create(input);
  return {
    id: entity.id,
    userId: entity.userId,
    amount: entity.amount,
    description: entity.description,
    source: entity.source,
    date: entity.date.toISOString(),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
