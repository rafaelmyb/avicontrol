import { prisma } from "@/lib/prisma";
import type { FeedInventoryEntity, CreateFeedInventoryInput } from "../domain/entities";
import type { IFeedInventoryRepository } from "../domain/repository";

function toEntity(row: {
  id: string;
  userId: string;
  name: string;
  feedType: string;
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
        feedType: data.feedType,
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

  async findByUserId(userId: string): Promise<FeedInventoryEntity[]> {
    const rows = await prisma.feedInventory.findMany({
      where: { userId },
      orderBy: { purchaseDate: "desc" },
    });
    return rows.map(toEntity);
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
        ...(data.feedType != null && { feedType: data.feedType }),
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
