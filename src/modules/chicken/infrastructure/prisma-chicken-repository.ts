import { prisma } from "@/lib/prisma";
import type { ChickenEntity, CreateChickenInput } from "../domain/entities";
import type { IChickenRepository } from "../domain/repository";
import { ChickenStatus as PrismaStatus } from "@prisma/client";

function toDomainStatus(s: PrismaStatus): ChickenEntity["status"] {
  return s as ChickenEntity["status"];
}

function toEntity(row: {
  id: string;
  userId: string;
  name: string;
  breed: string;
  birthDate: Date;
  status: PrismaStatus;
  createdAt: Date;
  updatedAt: Date;
}): ChickenEntity {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    breed: row.breed,
    birthDate: row.birthDate,
    status: toDomainStatus(row.status),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaChickenRepository implements IChickenRepository {
  async create(data: CreateChickenInput): Promise<ChickenEntity> {
    const row = await prisma.chicken.create({
      data: {
        userId: data.userId,
        name: data.name,
        breed: data.breed,
        birthDate: data.birthDate,
        status: data.status as PrismaStatus,
      },
    });
    return toEntity(row);
  }

  async findById(id: string, userId: string): Promise<ChickenEntity | null> {
    const row = await prisma.chicken.findFirst({
      where: { id, userId },
    });
    return row ? toEntity(row) : null;
  }

  async findByUserId(
    userId: string,
    options?: { skip?: number; take?: number }
  ): Promise<ChickenEntity[]> {
    const rows = await prisma.chicken.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: options?.skip,
      take: options?.take,
    });
    return rows.map(toEntity);
  }

  async countByUserId(userId: string): Promise<number> {
    return prisma.chicken.count({ where: { userId } });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<ChickenEntity, "name" | "breed" | "birthDate" | "status">>
  ): Promise<ChickenEntity | null> {
    const row = await prisma.chicken.updateMany({
      where: { id, userId },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.breed != null && { breed: data.breed }),
        ...(data.birthDate != null && { birthDate: data.birthDate }),
        ...(data.status != null && { status: data.status as PrismaStatus }),
      },
    });
    if (row.count === 0) return null;
    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.chicken.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }
}
