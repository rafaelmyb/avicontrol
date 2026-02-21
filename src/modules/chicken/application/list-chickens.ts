import type { IChickenRepository, ChickenListOptions } from "../domain/repository";
import type { ChickenSource } from "../domain/entities";
import { ageInDays, layStartDate } from "../domain/services";

export interface ChickenDto {
  id: string;
  userId: string;
  name: string;
  batchName: string | null;
  breed: string;
  birthDate: string;
  status: string;
  source: ChickenSource;
  purchasePrice: number | null;
  ageInDays: number;
  layStartDate: string;
  createdAt: string;
  updatedAt: string;
}

export async function listChickensByUser(
  repo: IChickenRepository,
  userId: string,
  options?: ChickenListOptions
): Promise<{ chickens: ChickenDto[]; total: number }> {
  const countFilter =
    options?.status || options?.batchName
      ? { status: options.status, batchName: options.batchName }
      : undefined;
  const [chickens, total] = await Promise.all([
    repo.findByUserId(userId, options),
    repo.countByUserId(userId, countFilter),
  ]);
  const now = new Date();
  const dtos: ChickenDto[] = chickens.map((c) => ({
    id: c.id,
    userId: c.userId,
    name: c.name,
    batchName: c.batchName,
    breed: c.breed,
    birthDate: c.birthDate.toISOString(),
    status: c.status,
    source: c.source,
    purchasePrice: c.purchasePrice,
    ageInDays: ageInDays(c.birthDate, now),
    layStartDate: layStartDate(c.birthDate).toISOString(),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
  return { chickens: dtos, total };
}
