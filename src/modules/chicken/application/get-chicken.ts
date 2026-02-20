import type { IChickenRepository } from "../domain/repository";
import { ageInDays, layStartDate } from "../domain/services";

export interface ChickenDto {
  id: string;
  userId: string;
  name: string;
  breed: string;
  birthDate: string;
  status: string;
  ageInDays: number;
  layStartDate: string;
  createdAt: string;
  updatedAt: string;
}

export async function getChicken(
  repo: IChickenRepository,
  id: string,
  userId: string
): Promise<ChickenDto | null> {
  const entity = await repo.findById(id, userId);
  if (!entity) return null;
  const now = new Date();
  return {
    id: entity.id,
    userId: entity.userId,
    name: entity.name,
    breed: entity.breed,
    birthDate: entity.birthDate.toISOString(),
    status: entity.status,
    ageInDays: ageInDays(entity.birthDate, now),
    layStartDate: layStartDate(entity.birthDate).toISOString(),
    createdAt: entity.createdAt.toISOString(),
    updatedAt: entity.updatedAt.toISOString(),
  };
}
