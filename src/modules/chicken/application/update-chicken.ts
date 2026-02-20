import type { ChickenStatus } from "../domain/entities";
import type { IChickenRepository } from "../domain/repository";

export interface UpdateChickenInput {
  name?: string;
  breed?: string;
  birthDate?: string;
  status?: string;
}

export interface ChickenDto {
  id: string;
  userId: string;
  name: string;
  breed: string;
  birthDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function updateChicken(
  repo: IChickenRepository,
  id: string,
  userId: string,
  input: UpdateChickenInput
): Promise<ChickenDto | null> {
  const data: Partial<{ name: string; breed: string; birthDate: Date; status: ChickenStatus }> = {};
  if (input.name != null) data.name = input.name;
  if (input.breed != null) data.breed = input.breed;
  if (input.birthDate != null) data.birthDate = new Date(input.birthDate);
  if (input.status != null) data.status = input.status as ChickenStatus;
  const entity = await repo.update(id, userId, data);
  if (!entity) return null;
  return {
    id: entity.id,
    userId: entity.userId,
    name: entity.name,
    breed: entity.breed,
    birthDate: entity.birthDate.toISOString(),
    status: entity.status,
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
