import { prisma } from "@/lib/prisma";
import type { RevenueEntity, CreateRevenueInput } from "../domain/entities";
import type { IRevenueRepository, FinanceListOptions } from "../domain/repository";

function toEntity(row: {
  id: string;
  userId: string;
  amount: number;
  description: string | null;
  source: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}): RevenueEntity {
  return {
    id: row.id,
    userId: row.userId,
    amount: row.amount,
    description: row.description,
    source: row.source,
    date: row.date,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaRevenueRepository implements IRevenueRepository {
  async create(data: CreateRevenueInput): Promise<RevenueEntity> {
    const row = await prisma.revenue.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        description: data.description ?? null,
        source: data.source ?? null,
        date: data.date,
      },
    });
    return toEntity(row);
  }

  async findById(id: string, userId: string): Promise<RevenueEntity | null> {
    const row = await prisma.revenue.findFirst({
      where: { id, userId },
    });
    return row ? toEntity(row) : null;
  }

  async findByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date,
    options?: FinanceListOptions
  ): Promise<RevenueEntity[]> {
    const orderByField = options?.orderBy ?? "date";
    const orderDirection = options?.orderDirection ?? "desc";
    const rows = await prisma.revenue.findMany({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { [orderByField]: orderDirection },
      skip: options?.skip,
      take: options?.take,
    });
    return rows.map(toEntity);
  }

  async countByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<number> {
    return prisma.revenue.count({
      where: { userId, date: { gte: start, lte: end } },
    });
  }

  async sumByUserIdAndDateRange(
    userId: string,
    start: Date,
    end: Date
  ): Promise<number> {
    const result = await prisma.revenue.aggregate({
      where: { userId, date: { gte: start, lte: end } },
      _sum: { amount: true },
    });
    return result._sum.amount ?? 0;
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<RevenueEntity, "amount" | "description" | "source" | "date">>
  ): Promise<RevenueEntity | null> {
    const updateData: {
      amount?: number;
      description?: string | null;
      source?: string | null;
      date?: Date;
    } = {};
    if (data.amount != null) updateData.amount = data.amount;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.source !== undefined) updateData.source = data.source;
    if (data.date != null) updateData.date = data.date;
    if (Object.keys(updateData).length === 0) {
      const row = await prisma.revenue.findFirst({ where: { id, userId } });
      return row ? toEntity(row) : null;
    }
    const result = await prisma.revenue.updateMany({
      where: { id, userId },
      data: updateData,
    });
    if (result.count === 0) return null;
    const row = await prisma.revenue.findFirst({ where: { id, userId } });
    return row ? toEntity(row) : null;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.revenue.deleteMany({
      where: { id, userId },
    });
    return result.count > 0;
  }
}
