import { prisma } from "@/lib/prisma";
import type {
  ChickenEntity,
  ChickenSex,
  ChickenSource,
  CreateChickenInput,
} from "../domain/entities";
import type { IChickenRepository, ChickenListOptions } from "../domain/repository";
import {
  ChickenStatus as PrismaStatus,
  ChickenSource as PrismaSource,
  ChickenSex as PrismaSex,
} from "@prisma/client";

function toDomainStatus(s: PrismaStatus): ChickenEntity["status"] {
  return s as ChickenEntity["status"];
}

function toDomainSource(s: PrismaSource): ChickenSource {
  return s as ChickenSource;
}

function toDomainSex(s: PrismaSex): ChickenSex {
  return s as ChickenSex;
}

function toEntity(row: {
  id: string;
  userId: string;
  name: string;
  batchName: string | null;
  breed: string;
  birthDate: Date;
  status: PrismaStatus;
  sex: PrismaSex;
  source: PrismaSource;
  purchasePrice: number | null;
  createdAt: Date;
  updatedAt: Date;
}): ChickenEntity {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    batchName: row.batchName,
    breed: row.breed,
    birthDate: row.birthDate,
    status: toDomainStatus(row.status),
    sex: toDomainSex(row.sex),
    source: toDomainSource(row.source),
    purchasePrice: row.purchasePrice,
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
        batchName: data.batchName ?? null,
        breed: data.breed,
        birthDate: data.birthDate,
        status: data.status as PrismaStatus,
        sex: (data.sex ?? "female") as PrismaSex,
        source: data.source as PrismaSource,
        purchasePrice: data.purchasePrice ?? null,
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
    options?: ChickenListOptions
  ): Promise<ChickenEntity[]> {
    const where: { userId: string; status?: PrismaStatus; batchName?: string } = { userId };
    if (options?.status) {
      where.status = options.status as PrismaStatus;
    }
    if (options?.batchName) {
      where.batchName = options.batchName;
    }
    const orderBy = (options?.orderBy ?? "createdAt") as "createdAt" | "name" | "birthDate";
    const orderDirection = options?.orderDirection ?? "desc";
    const rows = await prisma.chicken.findMany({
      where,
      orderBy: { [orderBy]: orderDirection },
      skip: options?.skip,
      take: options?.take,
    });
    return rows.map(toEntity);
  }

  async countByUserId(
    userId: string,
    options?: Pick<ChickenListOptions, "status" | "batchName">
  ): Promise<number> {
    const where: { userId: string; status?: PrismaStatus; batchName?: string } = { userId };
    if (options?.status) {
      where.status = options.status as PrismaStatus;
    }
    if (options?.batchName) {
      where.batchName = options.batchName;
    }
    return prisma.chicken.count({ where });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<ChickenEntity, "name" | "breed" | "birthDate" | "status" | "sex" | "source" | "purchasePrice">>
  ): Promise<ChickenEntity | null> {
    const row = await prisma.chicken.updateMany({
      where: { id, userId },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.breed != null && { breed: data.breed }),
        ...(data.birthDate != null && { birthDate: data.birthDate }),
        ...(data.status != null && { status: data.status as PrismaStatus }),
        ...(data.sex != null && { sex: data.sex as PrismaSex }),
        ...(data.source != null && { source: data.source as PrismaSource }),
        ...(data.purchasePrice !== undefined && { purchasePrice: data.purchasePrice }),
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
