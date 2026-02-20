import type { IChickenRepository } from "../domain/repository";
import type { CreateChickenInput } from "../domain/entities";

export interface CreateChickenResult {
  id: string;
  userId: string;
  name: string;
  breed: string;
  birthDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export async function createChicken(
  repo: IChickenRepository,
  input: CreateChickenInput
): Promise<CreateChickenResult> {
  const entity = await repo.create(input);
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
