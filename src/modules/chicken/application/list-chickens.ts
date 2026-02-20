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

export async function listChickensByUser(
  repo: IChickenRepository,
  userId: string,
  options?: { skip?: number; take?: number }
): Promise<{ chickens: ChickenDto[]; total: number }> {
  const [chickens, total] = await Promise.all([
    repo.findByUserId(userId, options),
    repo.countByUserId(userId),
  ]);
  const now = new Date();
  const dtos: ChickenDto[] = chickens.map((c) => ({
    id: c.id,
    userId: c.userId,
    name: c.name,
    breed: c.breed,
    birthDate: c.birthDate.toISOString(),
    status: c.status,
    ageInDays: ageInDays(c.birthDate, now),
    layStartDate: layStartDate(c.birthDate).toISOString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
  return { chickens: dtos, total };
}
