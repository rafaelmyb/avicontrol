import type { FeedType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { FeedInventoryEntity, CreateFeedInventoryInput } from "../domain/entities";
import type { IFeedInventoryRepository, FeedListOptions } from "../domain/repository";

function toEntity(row: {
  id: string;
  userId: string;
  name: string;
  feedType: FeedType;
  weightKg: number;
  price: number | null;
  consumptionPerBirdGrams: number;
  purchaseDate: Date;
  createdAt: Date;
  updatedAt: Date;
}): FeedInventoryEntity {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    feedType: row.feedType,
    weightKg: row.weightKg,
    price: row.price,
    consumptionPerBirdGrams: row.consumptionPerBirdGrams,
    purchaseDate: row.purchaseDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaFeedInventoryRepository implements IFeedInventoryRepository {
  async create(data: CreateFeedInventoryInput): Promise<FeedInventoryEntity> {
    const row = await prisma.feedInventory.create({
      data: {
        userId: data.userId,
        name: data.name,
        feedType: data.feedType as FeedType,
        weightKg: data.weightKg,
        price: data.price,
        consumptionPerBirdGrams: data.consumptionPerBirdGrams,
        purchaseDate: data.purchaseDate,
      },
    });
    return toEntity(row);
  }

  async findById(id: string, userId: string): Promise<FeedInventoryEntity | null> {
    const row = await prisma.feedInventory.findFirst({
      where: { id, userId },
    });
    return row ? toEntity(row) : null;
  }

  async findByUserId(userId: string, options?: FeedListOptions): Promise<FeedInventoryEntity[]> {
    const where: { userId: string; feedType?: FeedType } = { userId };
    if (options?.feedType) {
      where.feedType = options.feedType as FeedType;
    }
    const orderBy = (options?.orderBy ?? "purchaseDate") as "purchaseDate" | "name" | "createdAt";
    const orderDirection = options?.orderDirection ?? "desc";
    const rows = await prisma.feedInventory.findMany({
      where,
      orderBy: { [orderBy]: orderDirection },
      skip: options?.skip,
      take: options?.take,
    });
    return rows.map(toEntity);
  }

  async countByUserId(
    userId: string,
    options?: Pick<FeedListOptions, "feedType">
  ): Promise<number> {
    const where: { userId: string; feedType?: FeedType } = { userId };
    if (options?.feedType) {
      where.feedType = options.feedType as FeedType;
    }
    return prisma.feedInventory.count({ where });
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<FeedInventoryEntity, "name" | "feedType" | "weightKg" | "price" | "consumptionPerBirdGrams" | "purchaseDate">>
  ): Promise<FeedInventoryEntity | null> {
    const row = await prisma.feedInventory.updateMany({
      where: { id, userId },
      data: {
        ...(data.name != null && { name: data.name }),
        ...(data.feedType != null && { feedType: data.feedType as FeedType }),
        ...(data.weightKg != null && { weightKg: data.weightKg }),
        ...(data.price != null && { price: data.price }),
        ...(data.consumptionPerBirdGrams != null && { consumptionPerBirdGrams: data.consumptionPerBirdGrams }),
        ...(data.purchaseDate != null && { purchaseDate: data.purchaseDate }),
      },
    });
    if (row.count === 0) return null;
    return this.findById(id, userId);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.feedInventory.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }
}
