import type { ChickenSource, ChickenStatus } from "../domain/entities";
import type { IChickenRepository } from "../domain/repository";

export interface UpdateChickenInput {
  name?: string;
  breed?: string;
  birthDate?: string;
  status?: string;
  source?: string;
}

export interface ChickenDto {
  id: string;
  userId: string;
  name: string;
  breed: string;
  birthDate: string;
  status: string;
  source: ChickenSource;
  createdAt: string;
  updatedAt: string;
}

export async function updateChicken(
  repo: IChickenRepository,
  id: string,
  userId: string,
  input: UpdateChickenInput
): Promise<ChickenDto | null> {
  const data: Partial<{
    name: string;
    breed: string;
    birthDate: Date;
    status: ChickenStatus;
    source: ChickenSource;
  }> = {};
  if (input.name != null) data.name = input.name;
  if (input.breed != null) data.breed = input.breed;
  if (input.birthDate != null) data.birthDate = new Date(input.birthDate);
  if (input.status != null) data.status = input.status as ChickenStatus;
  if (input.source != null) data.source = input.source as ChickenSource;
  const entity = await repo.update(id, userId, data);
  if (!entity) return null;
  return {
    id: entity.id,
    userId: entity.userId,
    name: entity.name,
    breed: entity.breed,
    birthDate: entity.birthDate.toISOString(),
    status: entity.status,
    source: entity.source,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
